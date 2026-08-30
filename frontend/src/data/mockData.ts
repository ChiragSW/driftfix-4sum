import { StripeRelease, MigrationReport } from '../types';

export const SAMPLE_LATEST_RELEASE: StripeRelease = {
  version: "15.6.0",
  major: 15,
  published_at: "2026-08-28T14:22:10Z",
  release_url: "https://github.com/stripe/stripe-python/releases/tag/v15.6.0",
  prerelease: false
};

export const SAMPLE_MIGRATION_REPORT: MigrationReport = {
  status: "upgrade_available",
  current_version: "14.3.0",
  target_version: "15.6.0",
  breaking_changes: [
    {
      title: "StripeObject no longer behaves as a dict or inherits from dict mapping",
      summary: "StripeObject previously implemented mapping methods like .get(), .keys(), .items(), and dict(obj). In v15, objects are strict models; call .to_dict() first or access typed attributes directly.",
      search_hints: [".get(", ".keys(", ".values(", ".items(", "dict("],
      source_url: "https://github.com/stripe/stripe-python/wiki/Migration-guide-for-v15#stripeobject"
    },
    {
      title: "Native Decimal fields for currency and decimal numbers",
      summary: "Fields representing monetary amounts and rates now return Python Decimal instances instead of floats or string representations where applicable.",
      search_hints: ["_decimal", "Decimal("],
      source_url: "https://github.com/stripe/stripe-python/wiki/Migration-guide-for-v15#decimal-fields"
    },
    {
      title: "Minimum supported Python runtime is now 3.8+",
      summary: "Python 3.7 runtime support has been deprecated and dropped in Stripe Python SDK v15.",
      search_hints: ["requires-python", "python_requires"],
      source_url: "https://github.com/stripe/stripe-python/blob/v15.6.0/CHANGELOG.md#1500"
    }
  ],
  warnings: []
};

interface DemoPreset {
  filename: string;
  description: string;
  v14Code: string;
  v15FixedCode: string;
  breakingLines: number[];
  fixedLines: number[];
  rawDiff: string;
}

export const DEMO_PRESETS: Record<string, DemoPreset> = {
  "customer_service.py": {
    filename: "demo_target/customer_service.py",
    description: "Customer service layer utilizing legacy .get(), .keys(), .items() and dict(obj) on Stripe Customer objects.",
    v14Code: `"""Intentionally outdated Stripe v14 code for the migration demo."""

import stripe


def customer_email(customer: stripe.Customer) -> str | None:
    return customer.get("email")


def customer_fields(customer: stripe.Customer) -> list[str]:
    return sorted(customer.keys())


def customer_metadata(customer: stripe.Customer) -> dict[str, str]:
    return dict(customer.get("metadata", {}).items())


def customer_snapshot(customer: stripe.Customer) -> dict[str, object]:
    return dict(customer)
`,
    v15FixedCode: `"""Migrated Stripe v15 code using .to_dict() for dict compatibility."""

import stripe


def customer_email(customer: stripe.Customer) -> str | None:
    return customer.to_dict().get("email")


def customer_fields(customer: stripe.Customer) -> list[str]:
    return sorted(customer.to_dict().keys())


def customer_metadata(customer: stripe.Customer) -> dict[str, str]:
    return dict(customer.to_dict().get("metadata", {}).items())


def customer_snapshot(customer: stripe.Customer) -> dict[str, object]:
    return customer.to_dict()
`,
    breakingLines: [7, 11, 15, 19],
    fixedLines: [1, 7, 11, 15, 19],
    rawDiff: `--- a/demo_target/customer_service.py
+++ b/demo_target/customer_service.py
@@ -1 +1 @@
-"""Intentionally outdated Stripe v14 code for the migration demo."""
+"""Migrated Stripe v15 code using .to_dict() for dict compatibility."""
@@ -7 +7 @@
-    return customer.get("email")
+    return customer.to_dict().get("email")
@@ -11 +11 @@
-    return sorted(customer.keys())
+    return sorted(customer.to_dict().keys())
@@ -15 +15 @@
-    return dict(customer.get("metadata", {}).items())
+    return dict(customer.to_dict().get("metadata", {}).items())
@@ -19 +19 @@
-    return dict(customer)
+    return customer.to_dict()`
  },
  "invoice_service.py": {
    filename: "demo_target/invoice_service.py",
    description: "Invoice service parsing fields and item pairs from Stripe Invoice objects.",
    v14Code: `"""Intentionally outdated Stripe v14 code for the migration demo."""

import stripe


def invoice_summary(invoice: stripe.Invoice) -> dict[str, object]:
    return {
        "id": invoice.get("id"),
        "status": invoice.get("status"),
        "amount_due": invoice.get("amount_due", 0),
    }


def invoice_field_pairs(invoice: stripe.Invoice) -> dict[str, object]:
    return dict(invoice.items())
`,
    v15FixedCode: `"""Migrated Stripe v15 code using .to_dict() for dict compatibility."""

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
`,
    breakingLines: [8, 9, 10, 15],
    fixedLines: [1, 7, 9, 10, 11, 16],
    rawDiff: `--- a/demo_target/invoice_service.py
+++ b/demo_target/invoice_service.py
@@ -1 +1 @@
-"""Intentionally outdated Stripe v14 code for the migration demo."""
+"""Migrated Stripe v15 code using .to_dict() for dict compatibility."""
@@ -7,0 +7 @@
+    data = invoice.to_dict()
@@ -8,3 +9,3 @@
-        "id": invoice.get("id"),
-        "status": invoice.get("status"),
-        "amount_due": invoice.get("amount_due", 0),
+        "id": data.get("id"),
+        "status": data.get("status"),
+        "amount_due": data.get("amount_due", 0),
@@ -15 +16 @@
-    return dict(invoice.items())
+    return dict(invoice.to_dict().items())`
  }
};
