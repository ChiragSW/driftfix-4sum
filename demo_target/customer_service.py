"""Intentionally outdated Stripe integration used by the DriftFix demo."""

import stripe


def customer_email(customer: stripe.Customer) -> str | None:
    return customer.get("email")
