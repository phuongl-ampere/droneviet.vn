"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, MapPin, Trash2, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useOptionalCustomerSession } from "@/components/customer/customer-session-provider";
import { useI18n } from "@/components/i18n-provider";
import { useCart } from "@/components/store/cart-provider";
import {
  loadCheckoutAddresses,
  removeCheckoutAddress,
  saveCheckoutAddress,
  type CheckoutAddress,
} from "@/lib/commerce/checkout-address-book";
import {
  estimateCheckoutShipping,
  submitCheckout,
  type CheckoutFulfillmentMethod,
  type CheckoutPaymentMethod,
  type ShippingEstimate,
} from "@/lib/commerce/checkout";
import { formatVnd } from "@/lib/commerce/storefront-catalog";
import {
  fetchVnProvinces,
  fetchVnWards,
  type VnProvince,
  type VnWard,
} from "@/lib/commerce/vn-address";

type CheckoutStep = "delivery" | "shipping" | "review";

type CheckoutForm = {
  email: string;
  name: string;
  note: string;
  phone: string;
  province: string;
  streetAddress: string;
  ward: string;
};

type FieldErrors = Partial<Record<keyof CheckoutForm, string>>;

const stepOrder: CheckoutStep[] = ["delivery", "shipping", "review"];

function formatAddress(form: CheckoutForm): string {
  return [form.streetAddress, form.ward, form.province]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

function isVietnamesePhone(value: string): boolean {
  return /^0\d{8,10}$/.test(value.replace(/\s/g, ""));
}

export function CheckoutFlow() {
  const router = useRouter();
  const { clearCart, lines, totalVnd } = useCart();
  const { locale, t } = useI18n();
  const customerSession = useOptionalCustomerSession();
  const customer = customerSession?.user ?? null;
  const storeHref = locale === "vi" ? "/cua-hang" : "/en/store";
  const resultHref =
    locale === "vi" ? "/thanh-toan/ket-qua" : "/en/checkout/result";
  const [step, setStep] = useState<CheckoutStep>("delivery");
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<CheckoutFulfillmentMethod>("delivery");
  const [form, setForm] = useState<CheckoutForm>({
    email: "",
    name: "",
    note: "",
    phone: "",
    province: "",
    streetAddress: "",
    ward: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [provinces, setProvinces] = useState<VnProvince[]>([]);
  const [wards, setWards] = useState<VnWard[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedProvinceSlug, setSelectedProvinceSlug] = useState("");
  const [selectedWardId, setSelectedWardId] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressLoadError, setAddressLoadError] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<CheckoutAddress[]>([]);
  const [saveAddress, setSaveAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("payos");
  const [promotionCode, setPromotionCode] = useState("");
  const [shippingEstimate, setShippingEstimate] =
    useState<ShippingEstimate | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const address = useMemo(() => formatAddress(form), [form]);
  const currentStepIndex = stepOrder.indexOf(step);

  useEffect(() => {
    let cancelled = false;

    void fetchVnProvinces()
      .then((nextProvinces) => {
        if (!cancelled) {
          setProvinces(nextProvinces);
          setAddressLoadError("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAddressLoadError(t("checkout.flow.addressLoadError"));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    if (!selectedProvinceSlug) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setAddressLoading(true);

      try {
        const nextWards = await fetchVnWards(selectedProvinceSlug);

        if (!cancelled) {
          setWards(nextWards);
          setSelectedWardId((current) => {
            if (current || !form.ward) {
              return current;
            }

            return (
              nextWards.find((ward) => ward.name === form.ward)?.id ?? ""
            );
          });
          setAddressLoadError("");
        }
      } catch {
        if (!cancelled) {
          setWards([]);
          setAddressLoadError(t("checkout.flow.addressLoadError"));
        }
      } finally {
        if (!cancelled) {
          setAddressLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form.ward, selectedProvinceSlug, t]);

  useEffect(() => {
    if (!customer) {
      return;
    }

    const timer = window.setTimeout(() => {
      setForm((current) => ({
        ...current,
        email: current.email || customer.email,
        name: current.name || customer.displayName || "",
        phone: current.phone || customer.phone || "",
      }));
      setSavedAddresses(loadCheckoutAddresses());
    }, 0);

    return () => window.clearTimeout(timer);
  }, [customer]);

  function updateField<Key extends keyof CheckoutForm>(
    key: Key,
    value: CheckoutForm[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  function applySavedAddress(addressToApply: CheckoutAddress) {
    const province = provinces.find(
      (candidate) => candidate.name === addressToApply.province,
    );

    setForm((current) => ({
      ...current,
      email: addressToApply.email,
      name: addressToApply.name,
      phone: addressToApply.phone,
      province: addressToApply.province,
      streetAddress: addressToApply.streetAddress,
      ward: addressToApply.ward,
    }));
    setSelectedProvinceId(province?.id ?? "");
    setSelectedProvinceSlug(province?.slug ?? "");
    setSelectedWardId("");
    setWards([]);
    setFieldErrors({});
  }

  function deleteSavedAddress(addressToDelete: CheckoutAddress) {
    setSavedAddresses(removeCheckoutAddress(addressToDelete.id));
  }

  function handleProvinceChange(provinceId: string) {
    const province = provinces.find(
      (candidate) => candidate.id === provinceId,
    );
    setSelectedProvinceId(provinceId);
    setSelectedProvinceSlug(province?.slug ?? "");
    setSelectedWardId("");
    setWards([]);
    setAddressLoadError("");
    updateField("province", province?.name ?? "");
    updateField("ward", "");
  }

  function handleWardChange(wardId: string) {
    const ward = wards.find((candidate) => candidate.id === wardId);
    setSelectedWardId(wardId);
    updateField("ward", ward?.name ?? "");
  }

  function validateDelivery(): boolean {
    const nextErrors: FieldErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = t("checkout.flow.fieldRequired");
    }
    if (!form.phone.trim()) {
      nextErrors.phone = t("checkout.flow.fieldRequired");
    } else if (!isVietnamesePhone(form.phone)) {
      nextErrors.phone = t("checkout.flow.phoneInvalid");
    }
    if (fulfillmentMethod === "delivery") {
      if (!form.province.trim()) {
        nextErrors.province = t("checkout.flow.fieldRequired");
      }
      if (!form.ward.trim()) {
        nextErrors.ward = t("checkout.flow.fieldRequired");
      }
      if (!form.streetAddress.trim()) {
        nextErrors.streetAddress = t("checkout.flow.fieldRequired");
      }
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function continueCheckout() {
    setSubmitError("");

    if (step === "delivery") {
      if (!validateDelivery()) {
        return;
      }

      if (fulfillmentMethod === "delivery") {
        setShippingLoading(true);
        try {
          setShippingEstimate(
            await estimateCheckoutShipping({
              productPriceVnd: totalVnd,
              receiverProvince: form.province.trim(),
              weightG: Math.max(
                100,
                lines.reduce(
                  (totalWeight, line) => totalWeight + line.quantity * 100,
                  0,
                ),
              ),
            }),
          );
        } catch {
          setShippingEstimate({
            amountVnd: null,
            carrier: "manual",
            note: t("checkout.flow.shippingEstimateUnavailable"),
            pricingStatus: "manual_quote",
          });
        } finally {
          setShippingLoading(false);
        }
      }

      setStep("shipping");
      return;
    }

    if (step === "shipping") {
      setStep("review");
    }
  }

  async function placeOrder() {
    setSubmitError("");
    setSubmitting(true);

    try {
      const result = (await submitCheckout({
        contactEmail: form.email.trim() || undefined,
        contactName: form.name.trim(),
        contactPhone: form.phone.trim(),
        fulfillmentMethod,
        lines,
        paymentMethod,
        promotionCode: promotionCode.trim() || undefined,
        shippingAddress:
          fulfillmentMethod === "delivery"
            ? address
            : undefined,
        shippingNote: form.note.trim() || undefined,
      })) as {
        checkoutUrl?: string;
        order?: { orderNumber?: string };
      };

      if (customer && saveAddress && fulfillmentMethod === "delivery") {
        setSavedAddresses(
          saveCheckoutAddress({
            email: form.email.trim(),
            name: form.name.trim(),
            phone: form.phone.trim(),
            province: form.province.trim(),
            streetAddress: form.streetAddress.trim(),
            ward: form.ward.trim(),
          }),
        );
      }

      clearCart();

      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }

      if (!result.order?.orderNumber) {
        throw new Error("CHECKOUT_ORDER_NUMBER_MISSING");
      }

      router.replace(
        `${resultHref}?order=${encodeURIComponent(result.order.orderNumber)}`,
      );
    } catch {
      setSubmitError(t("checkout.flow.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <main className="min-h-screen bg-white px-5 py-20 text-[#10232A] sm:px-8">
        <div className="mx-auto max-w-3xl border-t border-black/15 pt-6">
          <h1 className="text-3xl font-semibold">{t("checkout.title")}</h1>
          <p className="mt-5 text-slate-600">{t("checkout.empty")}</p>
          <Link
            href={storeHref}
            className="mt-7 inline-flex min-h-11 items-center bg-[#10232A] px-4 text-sm font-semibold text-white transition hover:bg-[#006D66]"
          >
            {t("cart.browse")}
          </Link>
        </div>
      </main>
    );
  }

  const stepLabels: Record<CheckoutStep, string> = {
    delivery: t("checkout.flow.stepDelivery"),
    review: t("checkout.flow.stepReview"),
    shipping: t("checkout.flow.stepShipping"),
  };
  const deliverySelected = fulfillmentMethod === "delivery";
  const shippingDescription =
    fulfillmentMethod === "showroom_pickup"
      ? t("checkout.flow.pickupDescription")
      : shippingEstimate?.carrier === "manual"
        ? t("checkout.flow.shippingManualDescription")
        : shippingEstimate?.note || t("checkout.flow.shippingManualDescription");

  return (
    <main className="min-h-screen bg-[#F7FAFC] px-5 py-8 text-[#10232A] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="border-b border-black/10 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#006D66]">
            {t("store.storeName")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            {t("checkout.title")}
          </h1>
        </div>

        <ol
          aria-label={t("checkout.title")}
          className="mt-7 grid grid-cols-3 gap-2 border-b border-black/10 pb-6"
        >
          {stepOrder.map((nextStep, index) => {
            const isComplete = index < currentStepIndex;
            const isCurrent = nextStep === step;

            return (
              <li
                key={nextStep}
                className="grid grid-cols-[auto_1fr] items-center gap-2 text-left"
              >
                <span
                  className={`grid size-6 place-items-center rounded-full border text-[11px] font-semibold ${
                    isCurrent || isComplete
                      ? "border-[#006D66] bg-[#006D66] text-white"
                      : "border-black/15 bg-white text-slate-500"
                  }`}
                >
                  {isComplete ? <Check aria-hidden="true" size={13} /> : index + 1}
                </span>
                <span
                  className={`text-xs font-semibold sm:text-sm ${
                    isCurrent ? "text-[#10232A]" : "text-slate-500"
                  }`}
                >
                  <span className="block sm:hidden">
                    {t("checkout.flow.stepNumber", { number: index + 1 })}
                  </span>
                  <span className="hidden sm:block">{stepLabels[nextStep]}</span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="min-w-0">
            {step === "delivery" ? (
              <section className="border border-black/10 bg-white p-5 sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center bg-[#E8FBF8] text-[#006D66]">
                    <MapPin aria-hidden="true" size={18} />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {t("checkout.flow.stepDelivery")}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {t("checkout.contact")}
                    </p>
                  </div>
                </div>

                {customer && savedAddresses.length > 0 ? (
                  <section className="mt-7 border-y border-black/10 py-5">
                    <h3 className="text-sm font-semibold">
                      {t("checkout.flow.savedAddresses")}
                    </h3>
                    <div className="mt-3 grid gap-2">
                      {savedAddresses.map((savedAddress) => (
                        <div
                          key={savedAddress.id}
                          className="grid grid-cols-[1fr_auto] items-center gap-3 border border-black/10 p-3"
                        >
                          <button
                            type="button"
                            onClick={() => applySavedAddress(savedAddress)}
                            className="min-w-0 text-left text-sm transition hover:text-[#006D66]"
                          >
                            <span className="block truncate font-semibold">
                              {savedAddress.name}
                            </span>
                            <span className="mt-1 block truncate text-slate-600">
                              {savedAddress.streetAddress}, {savedAddress.ward},{" "}
                              {savedAddress.province}
                            </span>
                          </button>
                          <button
                            type="button"
                            aria-label={t("checkout.flow.removeAddress", {
                              name: savedAddress.name,
                            })}
                            title={t("checkout.flow.removeAddress", {
                              name: savedAddress.name,
                            })}
                            onClick={() => deleteSavedAddress(savedAddress)}
                            className="grid size-9 place-items-center text-slate-500 transition hover:text-red-600"
                          >
                            <Trash2 aria-hidden="true" size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                <fieldset className="mt-7">
                  <legend className="text-sm font-semibold">
                    {t("checkout.flow.reviewShipping")}
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label
                      className={`cursor-pointer border p-4 transition ${
                        deliverySelected
                          ? "border-[#006D66] bg-[#F0FFFC]"
                          : "border-black/10 hover:border-[#006D66]"
                      }`}
                    >
                      <input
                        aria-label={t("checkout.flow.delivery")}
                        checked={deliverySelected}
                        className="sr-only"
                        name="fulfillment-method"
                        onChange={() => {
                          setFulfillmentMethod("delivery");
                          setFieldErrors({});
                        }}
                        type="radio"
                        value="delivery"
                      />
                      <Truck aria-hidden="true" size={18} />
                      <span className="mt-3 block text-sm font-semibold">
                        {t("checkout.flow.delivery")}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-600">
                        {t("checkout.flow.deliveryDescription")}
                      </span>
                    </label>
                    <label
                      className={`cursor-pointer border p-4 transition ${
                        !deliverySelected
                          ? "border-[#006D66] bg-[#F0FFFC]"
                          : "border-black/10 hover:border-[#006D66]"
                      }`}
                    >
                      <input
                        aria-label={t("checkout.flow.showroomPickup")}
                        checked={!deliverySelected}
                        className="sr-only"
                        name="fulfillment-method"
                        onChange={() => {
                          setFulfillmentMethod("showroom_pickup");
                          setFieldErrors({});
                        }}
                        type="radio"
                        value="showroom_pickup"
                      />
                      <MapPin aria-hidden="true" size={18} />
                      <span className="mt-3 block text-sm font-semibold">
                        {t("checkout.flow.showroomPickup")}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-600">
                        {t("checkout.flow.showroomPickupDescription")}
                      </span>
                    </label>
                  </div>
                </fieldset>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <Field
                    error={fieldErrors.name}
                    label={t("common.fullName")}
                    onChange={(value) => updateField("name", value)}
                    value={form.name}
                  />
                  <Field
                    error={fieldErrors.phone}
                    inputMode="tel"
                    label={t("common.phone")}
                    onChange={(value) => updateField("phone", value)}
                    value={form.phone}
                  />
                  <Field
                    className="sm:col-span-2"
                    label={t("common.email")}
                    onChange={(value) => updateField("email", value)}
                    type="email"
                    value={form.email}
                  />
                  {deliverySelected ? (
                    <>
                      <SelectField
                        error={fieldErrors.province}
                        label={t("checkout.flow.province")}
                        disabled={provinces.length === 0}
                        onChange={handleProvinceChange}
                        options={provinces.map((province) => ({
                          label: province.name,
                          value: province.id,
                        }))}
                        placeholder={
                          provinces.length
                            ? t("checkout.flow.selectProvince")
                            : t("checkout.flow.loadingAddress")
                        }
                        value={selectedProvinceId}
                      />
                      <SelectField
                        error={fieldErrors.ward}
                        label={t("checkout.flow.ward")}
                        disabled={!selectedProvinceSlug || addressLoading}
                        onChange={handleWardChange}
                        options={wards.map((ward) => ({
                          label: ward.name,
                          value: ward.id,
                        }))}
                        placeholder={
                          addressLoading
                            ? t("checkout.flow.loadingAddress")
                            : t("checkout.flow.selectWard")
                        }
                        value={selectedWardId}
                      />
                      <Field
                        className="sm:col-span-2"
                        error={fieldErrors.streetAddress}
                        label={t("checkout.flow.streetAddress")}
                        onChange={(value) =>
                          updateField("streetAddress", value)
                        }
                        value={form.streetAddress}
                      />
                    </>
                  ) : null}
                  <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                    {t("checkout.flow.addressNote")}
                    <textarea
                      rows={3}
                      value={form.note}
                      onChange={(event) => updateField("note", event.target.value)}
                      className="border border-black/15 px-3 py-2 font-normal outline-none focus:border-[#006D66]"
                    />
                  </label>
                </div>
                {addressLoadError ? (
                  <p className="mt-4 border-l-2 border-red-600 pl-3 text-sm text-slate-700">
                    {addressLoadError}
                  </p>
                ) : null}

                {customer && deliverySelected ? (
                  <label className="mt-6 flex items-center gap-3 text-sm text-slate-700">
                    <input
                      checked={saveAddress}
                      onChange={(event) => setSaveAddress(event.target.checked)}
                      type="checkbox"
                    />
                    {t("checkout.flow.saveAddress")}
                  </label>
                ) : null}
              </section>
            ) : null}

            {step === "shipping" ? (
              <section className="border border-black/10 bg-white p-5 sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center bg-[#E8FBF8] text-[#006D66]">
                    <Truck aria-hidden="true" size={18} />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {t("checkout.flow.stepShipping")}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {t("checkout.flow.reviewShipping")}
                    </p>
                  </div>
                </div>

                <div className="mt-7 border border-[#006D66]/30 bg-[#F0FFFC] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold">
                        {fulfillmentMethod === "showroom_pickup"
                          ? t("checkout.flow.showroomPickup")
                          : t("checkout.flow.shippingManualTitle")}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {shippingLoading
                          ? t("common.loading")
                          : shippingDescription}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-[#006D66]">
                      {fulfillmentMethod === "showroom_pickup"
                        ? t("checkout.flow.pickupFree")
                        : t("checkout.flow.shippingManualTitle")}
                    </span>
                  </div>
                </div>
              </section>
            ) : null}

            {step === "review" ? (
              <section className="space-y-5">
                <section className="border border-black/10 bg-white p-5 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold">
                      {t("checkout.flow.stepReview")}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setStep("delivery")}
                      className="text-sm font-semibold text-[#006D66] hover:text-[#10232A]"
                    >
                      {t("checkout.flow.edit")}
                    </button>
                  </div>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {t("checkout.flow.reviewAddress")}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {fulfillmentMethod === "delivery"
                          ? address
                          : t("checkout.flow.reviewPickup")}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{form.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {t("checkout.flow.reviewShipping")}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {fulfillmentMethod === "delivery"
                          ? t("checkout.flow.delivery")
                          : t("checkout.flow.showroomPickup")}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {shippingDescription}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="border border-black/10 bg-white p-5 sm:p-7">
                  <h2 className="text-lg font-semibold">{t("checkout.payment")}</h2>
                  <div className="mt-5 grid gap-3">
                    {[
                      {
                        description: t("checkout.payosDescription"),
                        label: t("checkout.payos"),
                        value: "payos" as const,
                      },
                      {
                        description: t("checkout.codDescription"),
                        label: t("checkout.cod"),
                        value: "cod" as const,
                      },
                      {
                        description: t("checkout.bankTransferDescription"),
                        label: t("checkout.bankTransfer"),
                        value: "bank_transfer" as const,
                      },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex cursor-pointer gap-3 border p-4 transition ${
                          paymentMethod === method.value
                            ? "border-[#006D66] bg-[#F0FFFC]"
                            : "border-black/10 hover:border-[#006D66]"
                        }`}
                      >
                        <input
                          aria-label={method.label}
                          checked={paymentMethod === method.value}
                          name="payment-method"
                          onChange={() => setPaymentMethod(method.value)}
                          type="radio"
                          value={method.value}
                        />
                        <span>
                          <span className="block text-sm font-semibold">
                            {method.label}
                          </span>
                          <span className="mt-1 block text-sm leading-5 text-slate-600">
                            {method.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="border border-black/10 bg-white p-5 sm:p-7">
                  <label className="grid gap-2 text-sm font-medium">
                    {t("checkout.promotionCode")}
                    <input
                      value={promotionCode}
                      onChange={(event) => setPromotionCode(event.target.value)}
                      className="min-h-11 border border-black/15 px-3 font-normal uppercase outline-none focus:border-[#006D66]"
                    />
                  </label>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    {t("checkout.promotionNote")}
                  </p>
                </section>
              </section>
            ) : null}
          </section>

          <aside className="h-fit border border-black/10 bg-white p-5 lg:sticky lg:top-20">
            <h2 className="text-sm font-semibold">{t("cart.summary")}</h2>
            <ul className="mt-5 space-y-4 border-t border-black/10 pt-4">
              {lines.map((line) => (
                <li
                  key={line.slug}
                  className="flex items-start justify-between gap-4 text-sm"
                >
                  <span className="text-slate-600">
                    {line.title} × {line.quantity}
                  </span>
                  <span className="shrink-0 font-semibold">
                    {formatVnd(line.priceVnd * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex justify-between border-t border-black/10 pt-4">
              <span className="font-semibold">
                {t(
                  step === "review"
                    ? "checkout.flow.reviewTotal"
                    : "cart.subtotal",
                )}
              </span>
              <span className="font-semibold">{formatVnd(totalVnd)}</span>
            </div>
            {step === "review" ? (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void placeOrder()}
                className="mt-6 flex min-h-11 w-full items-center justify-center bg-[#10232A] px-4 text-sm font-semibold text-white transition hover:bg-[#006D66] disabled:bg-slate-400"
              >
                {submitting ? t("checkout.creatingOrder") : t("checkout.placeOrder")}
              </button>
            ) : (
              <button
                type="button"
                disabled={shippingLoading}
                onClick={() => void continueCheckout()}
                className="mt-6 flex min-h-11 w-full items-center justify-center bg-[#10232A] px-4 text-sm font-semibold text-white transition hover:bg-[#006D66] disabled:bg-slate-400"
              >
                {t("checkout.flow.continue")}
              </button>
            )}
            {step !== "delivery" ? (
              <button
                type="button"
                onClick={() =>
                  setStep(step === "review" ? "shipping" : "delivery")
                }
                className="mt-3 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-slate-600 transition hover:text-[#006D66]"
              >
                <ChevronLeft aria-hidden="true" size={16} />
                {t("checkout.flow.back")}
              </button>
            ) : null}
            {submitError ? (
              <p className="mt-4 border-l-2 border-red-600 pl-3 text-sm leading-6 text-slate-700">
                {submitError}
              </p>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  className,
  error,
  inputMode,
  label,
  onChange,
  type = "text",
  value,
}: {
  className?: string;
  error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  label: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  value: string;
}) {
  return (
    <label className={`grid gap-2 text-sm font-medium ${className ?? ""}`}>
      {label}
      <input
        aria-label={label}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`min-h-11 border px-3 font-normal outline-none focus:border-[#006D66] ${
          error ? "border-red-600" : "border-black/15"
        }`}
      />
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function SelectField({
  disabled,
  error,
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  disabled: boolean;
  error?: string;
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        aria-label={label}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`min-h-11 border bg-white px-3 font-normal outline-none focus:border-[#006D66] disabled:bg-slate-100 disabled:text-slate-500 ${
          error ? "border-red-600" : "border-black/15"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
