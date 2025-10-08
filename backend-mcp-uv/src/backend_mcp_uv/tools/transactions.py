"""Transaction-related MCP tool definitions."""

from __future__ import annotations

from typing import Annotated

from pydantic import Field, PositiveInt

from ..http_client import request_json, request_void
from ..schemas import (
    Transaction,
    TransactionCreate,
    TransactionUpdatePayload,
    transaction_adapter,
    transaction_list_adapter,
)


def register_transaction_tools(server) -> None:
    """Register transaction tools on the provided MCP server."""

    @server.tool(
        name="list_transactions",
        description="Retrieve all property and tenant transactions.",
    )
    async def list_transactions() -> list[Transaction]:
        return await request_json("GET", "/api/transactions", adapter=transaction_list_adapter)

    @server.tool(name="get_transaction", description="Fetch a transaction by identifier.")
    async def get_transaction(
        transaction_id: Annotated[PositiveInt, Field(description="Unique transaction identifier")],
    ) -> Transaction:
        return await request_json(
            "GET",
            f"/api/transactions/{transaction_id}",
            adapter=transaction_adapter,
        )

    @server.tool(
        name="create_transaction",
        description="Create a transaction. Requires property, type, amount, and transaction date.",
    )
    async def create_transaction(payload: TransactionCreate) -> Transaction:
        return await request_json(
            "POST",
            "/api/transactions",
            body=payload.model_dump(exclude_none=True),
            adapter=transaction_adapter,
        )

    @server.tool(
        name="update_transaction",
        description="Update a transaction by identifier. Provide at least one field to change.",
    )
    async def update_transaction(payload: TransactionUpdatePayload) -> Transaction:
        body = payload.model_dump(exclude_none=True)
        transaction_id = body.pop("id")
        return await request_json(
            "PUT",
            f"/api/transactions/{transaction_id}",
            body=body,
            adapter=transaction_adapter,
        )

    @server.tool(name="delete_transaction", description="Delete a transaction by identifier.")
    async def delete_transaction(
        transaction_id: Annotated[PositiveInt, Field(description="Unique transaction identifier")],
    ) -> str:
        await request_void("DELETE", f"/api/transactions/{transaction_id}")
        return f"Transaction {transaction_id} deleted successfully."
