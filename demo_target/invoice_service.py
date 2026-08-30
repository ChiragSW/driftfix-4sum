"""Intentionally outdated Stripe v14 code for the migration demo."""

import stripe


def invoice_summary(invoice: stripe.Invoice) -> dict[str, object]:
    return {
        "id": invoice.get("id"),
        "status": invoice.get("status"),
        "amount_due": invoice.get("amount_due", 0),
    }


def invoice_field_pairs(invoice: stripe.Invoice) -> dict[str, object]:
    return dict(invoice.items())
