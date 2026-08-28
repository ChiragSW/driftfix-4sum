import stripe

from customer_service import customer_email


def test_customer_email() -> None:
    customer = stripe.Customer.construct_from(
        {"id": "cus_demo", "email": "judge@example.com"},
        "sk_test_demo",
    )

    assert customer_email(customer) == "judge@example.com"
