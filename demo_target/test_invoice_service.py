import stripe

from invoice_service import invoice_field_pairs, invoice_summary


def invoice() -> stripe.Invoice:
    return stripe.Invoice.construct_from(
        {"id": "in_demo", "status": "open", "amount_due": 4200},
        "sk_test_demo",
    )


def test_invoice_summary() -> None:
    assert invoice_summary(invoice()) == {
        "id": "in_demo",
        "status": "open",
        "amount_due": 4200,
    }


def test_invoice_field_pairs() -> None:
    assert invoice_field_pairs(invoice())["id"] == "in_demo"
