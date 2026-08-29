"""Small demo helpers that exercise Stripe invoice objects."""

import stripe


def invoice_summary(invoice: stripe.Invoice) -> dict[str, object]:
    data = invoice.to_dict()
    return {
        "id": data.get("id"),
        "status": data.get("status"),
        "amount_due": data.get("amount_due", 0),
    }


def invoice_field_pairs(invoice: stripe.Invoice) -> dict[str, object]:
    return dict(invoice.to_dict().items())
