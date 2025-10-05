# UML Diagrams Reference Guide

This comprehensive guide covers all types of UML (Unified Modeling Language) diagrams with detailed examples and use cases.

## Table of Contents
- [Structural Diagrams](#structural-diagrams-static-aspects)
- [Behavioral Diagrams](#behavioral-diagrams-dynamic-aspects)
- [When to Use Each Diagram Type](#when-to-use-each-diagram-type)

## Structural Diagrams (Static Aspects)

These diagrams depict the static aspects of a system, illustrating its architecture and the relationships between components.

### 1. Class Diagram
Shows classes, their attributes, methods, and relationships.

**Example:** Online Shopping System
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │   Product   │    │    Order    │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ - userId    │    │ - productId │    │ - orderId   │
│ - name      │    │ - name      │    │ - date      │
│ - email     │    │ - price     │    │ - total     │
├─────────────┤    │ - stock     │    │ - status    │
│ + login()   │    ├─────────────┤    ├─────────────┤
│ + logout()  │    │ + add()     │    │ + create()  │
└─────────────┘    │ + remove()  │    │ + update()  │
       │           └─────────────┘    └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌─────────────┐
                    │   Payment   │
                    ├─────────────┤
                    │ - paymentId │
                    │ - amount    │
                    │ - method    │
                    ├─────────────┤
                    │ + process() │
                    └─────────────┘
```

### 2. Object Diagram
Shows instances of classes at a specific point in time.

**Example:** Current Shopping Cart State
```
user1:User          order1:Order
├─ userId = 123     ├─ orderId = 001
├─ name = "John"    ├─ date = "2024-01-15"
└─ email = "j@e.com"├─ total = $150.00
                    └─ status = "Pending"

product1:Product    product2:Product
├─ productId = 101 ├─ productId = 102
├─ name = "Laptop" ├─ name = "Mouse"
├─ price = $1000   ├─ price = $25
└─ stock = 5       └─ stock = 50
```

### 3. Component Diagram
Shows organization and dependencies of software components.

**Example:** E-commerce Application Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile App     │    │   Admin Panel   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      API Gateway          │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼───────┐    ┌───────────▼───────────┐    ┌───────▼───────┐
│ User Service  │    │  Product Service     │    │ Order Service │
└───────────────┘    └──────────────────────┘    └───────────────┘
        │                         │                         │
        └─────────────────────────┼─────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │       Database            │
                    └───────────────────────────┘
```

### 4. Deployment Diagram
Shows physical deployment of artifacts on nodes.

**Example:** Production Environment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Web Server    │    │  Database Server│
│   (nginx)       │    │   (Node.js)     │    │   (PostgreSQL)  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Cloud Provider       │
                    │        (AWS/Azure)       │
                    └───────────────────────────┘
```

### 5. Package Diagram
Organizes elements into packages showing dependencies.

**Example:** Software Package Structure
```
┌─────────────────┐    ┌─────────────────┐
│   com.company   │    │   com.company   │
│   .ecommerce    │    │   .ecommerce    │
│   .models       │    │   .services     │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │   com.company.ecommerce   │
                    │        .controllers       │
                    └───────────────────────────┘
```

### 6. Composite Structure Diagram
Shows the internal structure of a class and collaborations.

**Example:** Car Engine System
```
┌─────────────────────────────────────────┐
│              Car                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │ Engine  │  │Transm.  │  │ Wheels  │  │
│  └─────────┘  └─────────┘  └─────────┘  │
│       │            │            │      │
│       └────────────┼────────────┘      │
│                    │                   │
│              ┌─────▼─────┐             │
│              │  Control  │             │
│              │  System   │             │
│              └───────────┘             │
└─────────────────────────────────────────┘
```

### 7. Profile Diagram
Defines custom stereotypes and constraints.

**Example:** Custom UML Profile
```
┌─────────────────────────────────────────┐
│           <<stereotype>>                │
│            WebService                   │
│  ┌─────────────────────────────────────┐ │
│  │ + endpoint: String                  │ │
│  │ + version: String                   │ │
│  │ + authentication: Boolean          │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Behavioral Diagrams (Dynamic Aspects)

These diagrams capture the dynamic aspects of a system, focusing on behavior and interactions over time.

### 1. Use Case Diagram
Shows actors and their interactions with the system.

**Example:** ATM System
```
    ┌─────────┐                    ┌─────────┐
    │Customer │                    │  Bank   │
    └────┬────┘                    └────┬────┘
         │                              │
         │                              │
    ┌────▼──────────────────────────────▼────┐
    │              ATM System                │
    │  ┌─────────────┐  ┌─────────────┐     │
    │  │ Withdraw    │  │  Deposit    │     │
    │  │ Cash        │  │  Money      │     │
    │  └─────────────┘  └─────────────┘     │
    │  ┌─────────────┐  ┌─────────────┐     │
    │  │ Check       │  │ Transfer    │     │
    │  │ Balance     │  │ Funds       │     │
    │  └─────────────┘  └─────────────┘     │
    └───────────────────────────────────────┘
```

### 2. Sequence Diagram
Shows object interactions over time.

**Example:** User Login Process
```
User    LoginPage    AuthService    Database
 │         │             │             │
 │────────▶│             │             │
 │  1. Enter credentials │             │
 │         │             │             │
 │         │────────────▶│             │
 │         │  2. Validate │             │
 │         │             │             │
 │         │             │────────────▶│
 │         │             │  3. Query   │
 │         │             │◀────────────│
 │         │             │  4. Result  │
 │         │◀────────────│             │
 │         │  5. Response│             │
 │◀────────│             │             │
 │  6. Success/Error     │             │
```

### 3. Activity Diagram
Shows workflow and business processes.

**Example:** Order Processing Workflow
```
    ┌─────────────┐
    │ Start Order │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ Validate    │
    │ Customer    │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ Check       │
    │ Inventory   │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ Calculate   │
    │ Total       │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ Process     │
    │ Payment     │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ Update      │
    │ Inventory   │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ Send        │
    │ Confirmation│
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ End         │
    └─────────────┘
```

### 4. State Machine Diagram
Shows object states and transitions.

**Example:** Order State Machine
```
    ┌─────────┐
    │ Pending │
    └────┬───┘
         │
         │ payment received
         ▼
    ┌─────────┐
    │ Paid   │
    └────┬───┘
         │
         │ shipped
         ▼
    ┌─────────┐
    │Shipped │
    └────┬───┘
         │
         │ delivered
         ▼
    ┌─────────┐
    │Delivered│
    └─────────┘
```

### 5. Communication Diagram
Shows object interactions with focus on relationships.

**Example:** Customer Service System
```
    Customer ────── ServiceAgent ────── SupportTicket
       │                │                    │
       │ 1. report issue │                    │
       │────────────────▶│                    │
       │                 │ 2. create ticket   │
       │                 │───────────────────▶│
       │                 │                    │
       │                 │ 3. assign priority │
       │                 │◀───────────────────│
       │                 │                    │
       │ 4. ticket number│                    │
       │◀────────────────│                    │
```

### 6. Timing Diagram
Shows timing constraints and state changes.

**Example:** System Response Timing
```
Time: 0ms    100ms   200ms   300ms   400ms
      │       │       │       │       │
State:│───────│───────│───────│───────│
      │       │       │       │       │
      │  Idle │  Busy │  Idle │  Busy │
      │       │       │       │       │
      │       │       │       │       │
      └───────┴───────┴───────┴───────┘
```

### 7. Interaction Overview Diagram
Combines activity and sequence diagrams.

**Example:** E-commerce Checkout Process
```
    ┌─────────────┐
    │ Start      │
    └─────┬──────┘
          │
    ┌─────▼──────┐
    │ Select     │
    │ Product    │
    └─────┬──────┘
          │
    ┌─────▼──────┐
    │ Enter      │
    │ Shipping   │
    └─────┬──────┘
          │
    ┌─────▼──────┐
    │ Process    │
    │ Payment    │
    └─────┬──────┘
          │
    ┌─────▼──────┐
    │ Confirm    │
    │ Order      │
    └────────────┘
```

## When to Use Each Diagram Type

### Structural Diagrams
- **Class Diagram**: System design and architecture, object-oriented modeling
- **Object Diagram**: Debugging, testing specific scenarios, documenting system state
- **Component Diagram**: System architecture, microservices design, modular systems
- **Deployment Diagram**: Infrastructure planning, DevOps, system deployment
- **Package Diagram**: Code organization, module dependencies, project structure
- **Composite Structure Diagram**: Complex object modeling, component interactions
- **Profile Diagram**: Domain-specific modeling, extending UML for specific needs

### Behavioral Diagrams
- **Use Case Diagram**: Requirements gathering, stakeholder communication, system scope
- **Sequence Diagram**: Detailed interaction analysis, API design, debugging complex flows
- **Activity Diagram**: Business process modeling, workflow design, algorithm visualization
- **State Machine Diagram**: Object lifecycle modeling, UI state management, protocol design
- **Communication Diagram**: Object relationship analysis, system integration
- **Timing Diagram**: Real-time systems, performance analysis, timing constraints
- **Interaction Overview Diagram**: Complex process overview, combining multiple interactions

## Best Practices

1. **Start with Use Cases**: Begin with use case diagrams to understand system requirements
2. **Model Structure First**: Use class and component diagrams to establish system architecture
3. **Add Behavior**: Use sequence and activity diagrams to model system behavior
4. **Keep It Simple**: Don't over-complicate diagrams; focus on essential elements
5. **Use Consistent Notation**: Follow UML standards for symbols and relationships
6. **Document Assumptions**: Add notes and constraints where necessary
7. **Iterate and Refine**: UML diagrams should evolve with your understanding of the system

## Tools for Creating UML Diagrams

- **Lucidchart**: Web-based diagramming tool with UML templates
- **Draw.io (diagrams.net)**: Free online diagramming tool
- **Visual Paradigm**: Professional UML modeling tool
- **Enterprise Architect**: Comprehensive modeling platform
- **PlantUML**: Text-based UML diagram generation
- **yEd**: Free diagram editor with UML support

## Conclusion

UML diagrams provide a standardized way to visualize and communicate software system designs. Each diagram type serves a specific purpose and is most effective when used in the appropriate context. By understanding when and how to use each diagram type, you can create clear, comprehensive models of your systems that facilitate better communication and understanding among team members.