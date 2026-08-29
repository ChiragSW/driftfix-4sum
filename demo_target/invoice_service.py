"""Stripe v15-compatible code for the migration demo."""

import stripe


def invoice_summary(invoice: stripe.Invoice) -> dict[str, object]:
    invoice_data = invoice.to_dict()
    return {
        "id": invoice_data.get("id"),
        "status": invoice_data.get("status"),
        "amount_due": invoice_data.get("amount_due", 0),
    }


def invoice_field_pairs(invoice: stripe.Invoice) -> dict[str, object]:
    return dict(invoice.to_dict().items())
