# Multi-AZ Spot Instance Migration

## Changes Made

### Infrastructure Changes (Terraform)

#### 1. `main.tf` - Multi-AZ VPC
- **Before**: Single subnet in us-east-1a
- **After**: 3 subnets across us-east-1a, us-east-1b, us-east-1c
- **Benefit**: Better Spot availability, reduced interruption frequency

#### 2. `compute.tf` - Auto Scaling Group
- **Before**: Single `aws_instance` with persistent Spot request
- **After**: `aws_autoscaling_group` with mixed instances policy
- **Key Features**:
  - Automatically replaces interrupted instances
  - Uses `price-capacity-optimized` allocation strategy
  - Supports 3 instance types: t3.small, t3a.small, t2.small
  - Spans all 3 availability zones

#### 3. `AWS_LOWCOST_GUIDE.md` - Documentation
- Updated architecture description
- Revised cost analysis (now ~$11-13/month vs ~$22.50/month)
- Added Spot-specific trade-offs and considerations
- Documented multi-AZ benefits

## Cost Impact
- **Previous**: ~$22.50/month (On-Demand)
- **New**: ~$11-13/month (Spot with multi-AZ)
- **Savings**: ~50% reduction

## Availability Impact
- **Previous**: Frequent interruptions (5+ times today in single AZ)
- **Expected**: Significantly fewer interruptions with 3 AZs + instance diversification
- **Recovery**: Automatic replacement via Auto Scaling Group (2-5 min downtime)

## Next Steps

### 1. Review Changes
```bash
cd infrastructure/terraform-lowcost
git diff
```

### 2. Plan Terraform Changes
```bash
terraform plan
```

**Expected changes**:
- Destroy: 1 instance, 1 subnet, 1 route table association
- Create: 3 subnets, 3 route table associations, 1 Auto Scaling Group
- Modify: Launch template (remove subnet_id, remove instance_market_options)

### 3. Apply Changes
```bash
terraform apply
```

**⚠️ Warning**: This will:
- Terminate your current instance
- Create new Auto Scaling Group
- Launch new instance in one of the 3 AZs
- **Database data is safe on EFS** - it will be automatically remounted on the new instance.
- **Local data (not on /mnt/efs) will be lost** - backup any custom local files if needed!

### 4. Verify Deployment
```bash
# Check Auto Scaling Group
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names lowcost-env-app-asg \
  --region us-east-1

# Check running instances
aws ec2 describe-instances \
  --filters "Name=tag:Environment,Values=lowcost-env" \
            "Name=instance-state-name,Values=running" \
  --region us-east-1
```

### 5. Update CodeDeploy (if needed)
CodeDeploy should automatically discover instances via the `CodeDeployGroup` tag. Verify deployment group is configured for Auto Scaling Groups.

## Rollback Plan
If issues occur, revert changes:
```bash
git checkout HEAD -- infrastructure/terraform-lowcost/main.tf infrastructure/terraform-lowcost/compute.tf
terraform apply
```

## Monitoring Recommendations
1. Set up CloudWatch alarms for:
   - Spot interruption warnings
   - Auto Scaling Group health
   - Instance state changes

2. Enable Backups:
   - **EFS Backup**: Use AWS Backup for automated EFS recovery points.
   - **EBS Snapshots**: Automated daily snapshots for the root volume (optional but recommended).
