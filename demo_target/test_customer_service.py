import stripe

from customer_service import (
    customer_email,
    customer_fields,
    customer_metadata,
    customer_snapshot,
)


def customer() -> stripe.Customer:
    return stripe.Customer.construct_from(
        {
            "id": "cus_demo",
            "email": "judge@example.com",
            "metadata": {"region": "apac", "tier": "gold"},
        },
        "sk_test_demo",
    )


def test_customer_email() -> None:
    assert customer_email(customer()) == "judge@example.com"


def test_customer_fields() -> None:
    assert {"email", "id", "metadata"} <= set(customer_fields(customer()))


def test_customer_metadata() -> None:
    assert customer_metadata(customer()) == {"region": "apac", "tier": "gold"}


def test_customer_snapshot() -> None:
    assert customer_snapshot(customer())["id"] == "cus_demo"


def test_missing_email_remains_optional() -> None:
    customer = stripe.Customer.construct_from(
        {"id": "cus_no_email"},
        "sk_test_demo",
    )

    assert customer_email(customer) is None
