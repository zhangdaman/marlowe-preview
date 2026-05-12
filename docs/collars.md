# Collars — Product Spec

> Companion accessory to the Marlowe titanium tag. v1 launch alongside tag.
> Decision date: 2026-05-07. Pricing locked: **$49 USD**.

---

## 1. Positioning

- **Companion accessory** — not a substitute for the tag. Customers can buy a collar with their tag, a collar alone (after their first tag order), or a tag alone.
- **Single product, no customization** — unlike the tag (which is the AI-personalized hero product), the collar is a **selectable-but-fixed** product: pick a color and size, that's it. No engraving, no AI, no NFC.
- **Heritage material consistency** — veg-tan leather + titanium hardware (same metal grade as the tag's substrate) keeps the brand language unified.
- **Made-to-order alignment** — collars are cut + finished to order, shipped together with the customer's tag (or alone if no tag in the cart). Production timeline matches tag: 7–10 business days.

## 2. SKU matrix

**3 colors × 5 sizes = 15 SKUs**, single unit price **$49 USD**.

### Colors

| Code | Name | Description |
|---|---|---|
| `tan` | Tan | Natural vegetable-tanned leather, unfinished — develops patina with wear |
| `saddle` | Saddle | Deep brown finish, classic working-dog look |
| `black` | Black | Lightly oiled black finish, neutral |

### Sizes (neck circumference)

| Code | Size | Range (cm) | Range (in) | Typical breeds |
|---|---|---|---|---|
| `xs` | XS | 25–33 cm | 10–13" | Chihuahua, Yorkie, toy breeds |
| `s` | S | 30–40 cm | 12–16" | Beagle, French Bulldog, small terriers |
| `m` | M | 35–50 cm | 14–20" | Labrador (puppy / lean), Corgi, Border Collie |
| `l` | L | 45–60 cm | 18–24" | Golden Retriever, adult Labrador, German Shepherd |
| `xl` | XL | 55–70 cm | 22–28" | Rottweiler, Doberman, Bernese Mountain Dog, Saint Bernard |

**Width**: 25 mm (1") fixed across all sizes. (Width variants are v2 backlog if customer demand surfaces.)

## 3. Material spec

| Component | Spec |
|---|---|
| **Strap** | Vegetable-tanned full-grain cowhide, 3–4 mm thickness |
| **Edge finish** | Burnished, beeswax-sealed (no plastic edge coatings) |
| **Stitching** | Bonded polyester thread, saddle-stitch by hand, contrast natural color |
| **Buckle** | Titanium roller buckle, brushed finish (matches `silver` tag finish) |
| **D-ring** (where tag attaches) | Titanium D-ring, brushed, welded closed |
| **Keeper loop** | Single titanium-reinforced leather loop |
| **Holes** | 7 punched holes, 25 mm apart |
| **Rivets** | Titanium (where applicable for D-ring reinforcement) |

**Why titanium hardware instead of brass / stainless steel**: matches the tag's "won't rust / won't oxidize" promise. Brass buckles patina green over time, stainless steel can pit. Titanium does neither.

## 4. Pricing

- **$49 USD** flat, all colors / all sizes
- Free U.S. shipping (combined with tag if both in cart)
- Same Stripe checkout, same Sales Tax handling. Collars are made-to-order alongside the tag, so they follow the same "final once placed" policy as the tag (no buyer-cancellation; 30-day size exchange covers fit issues).

## 5. Production & fulfillment

- **Made to order**: collar is cut from raw hide, hardware riveted, holes punched, edges burnished only after the customer places the order. Matches the tag's "no inventory" production model.
- **Production time**: 7–10 business days (same as tag).
- **If ordered with a tag**: shipped together in one package after both items are ready.
- **If ordered alone**: ships within 7–10 business days.
- **Workshop**: same California atelier as the tag (no separate fulfillment partner).

## 6. Sizing guide (customer-facing)

How to measure:

1. Use a soft tape measure (or a piece of string + ruler).
2. Wrap snugly around the base of the dog's neck — where the collar would sit.
3. Add 2 cm (0.75") for comfortable fit (puppies who'll grow: add 4 cm).
4. Cross-reference the size table on the product page.

**Tip**: If your dog measures right at a size boundary, size up — the leather will soften with wear, and our buckle has 7 holes for adjustment range.

## 7. Returns & exchanges

Different from the tag because collars are not engraved / personalized:

- **Size exchanges** within 30 days — full free exchange (no restocking fee). Customer keeps the original until the new one arrives, then returns the original in our prepaid bag.
- **Color exchanges** within 30 days — same as size exchanges.
- **Defects** — covered the same way as the tag (cracks, hardware failure, stitching coming apart).
- **Conditions**: collar must be unworn or only lightly tried on. Heavily worn / dog-chewed / wet collars cannot be exchanged.

This is **more lenient** than the tag's "final sale" policy because collars don't involve AI / personalization — sizing is the main risk and we want to remove that friction.

Cross-reference: [returns.html](../returns.html) needs an "if it's a collar" subsection added in v1.5 cleanup.

## 8. Care & maintenance

- Wipe with a soft damp cloth; dry naturally
- Treat with a small amount of unscented leather conditioner every 3–6 months (saddle soap, mink oil, or beeswax balm)
- Avoid prolonged soaking (rivers, beach swims) — water saturation shortens leather lifespan
- Tan color will **darken naturally with use**; this is expected patina, not damage
- Titanium hardware needs zero maintenance

## 9. Cart & checkout integration

- New cart item shape (front-end spec):
  ```js
  {
    productType: 'collar',
    color: 'tan' | 'saddle' | 'black',
    size: 'xs' | 's' | 'm' | 'l' | 'xl',
    unitPrice: 49,
    quantity: <int>,
    svg: <pre-rendered thumbnail>,
    addedAt: ISO timestamp,
  }
  ```
- Existing tag items get `productType: 'tag'` added (default if absent).
- Cart subtotal sums both product types.
- "You may also like" section appears in cart when a tag is present and no collar is.

## 10. Backend schema additions (for backend team)

```sql
-- in cart_items / orders.items[]:
ALTER TABLE cart_items ADD COLUMN product_type text NOT NULL DEFAULT 'tag';
ALTER TABLE cart_items ADD COLUMN collar_color text;  -- nullable, only for collars
ALTER TABLE cart_items ADD COLUMN collar_size text;   -- nullable, only for collars
-- (shape, color, pet_name, pet_phone are only set when product_type = 'tag')
```

Same fields mirrored in `orders.items` JSONB or normalized child table.

## 11. v1.5+ backlog

- **Width variants** (15 mm / 20 mm for smaller dogs)
- **Custom hole spacing** (for in-between sizes)
- **Reverse-side stamping** on the collar (initials, small phrase) — careful: brings back personalization complexity
- **Matching leash** (same leather + titanium hardware, $39–$49)
- **Patina cards** in the package showing how each color ages over 1 / 3 / 5 years (heritage marketing touch)

## 12. Open questions for ops / factory

- [ ] Confirm tannery source for the veg-tan hide — full-grain cowhide, ~3–4 mm thickness
- [ ] Confirm titanium hardware supplier (buckle + D-ring + rivets) — needs to match tag's grade
- [ ] Hand saddle-stitch vs machine stitch — hand stitch is brand-on but slower; decide based on factory capacity for ~50 units/week ramp
- [ ] Packaging: same linen pouch as the tag, or different (e.g., a leather scrap insert showing how the leather will age)?
- [ ] Sizing returns labor cost: estimate exchange rate (industry baseline is 10–15% of orders), factor into margin math

---

## Changelog
- **2026-05-07** — Initial spec, v1 launch alongside tag.
