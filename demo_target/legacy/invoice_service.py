"""Stripe v14 code intentionally kept for the migration demonstration."""

import stripe


def invoice_summary(invoice: stripe.Invoice) -> dict[str, object]:
    return {
        "id": invoice.get("id"),
        "status": invoice.get("status"),
        "amount_due": invoice.get("amount_due", 0),
    }


def invoice_field_pairs(invoice: stripe.Invoice) -> dict[str, object]:
    return dict(invoice.items())
