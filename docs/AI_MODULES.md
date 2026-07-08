# AI Modules

## Principles

- AI must never invent wardrobe items as owned.
- AI outputs must include confidence and explainability where user-facing.
- User can edit AI-generated wardrobe tags before saving.
- AI failure must degrade gracefully to manual entry.
- Personal photos require explicit consent.
- User photos are not used for training unless the user opts in.

## Auto Tagging

Input: wardrobe image ID or signed internal image URL. Output: category, subcategory, dominant color, secondary colors, pattern, fabric guess, style tags, occasion tags, season tags, confidence scores.

Models: fashion classifier, color extraction pipeline, optional CLIP/image embedding model.

Fallback: manual form remains fully usable.

## Similar Clothing Detection

Input: wardrobe item or purchase image. Output: similar owned items, similarity score, matched visual attributes, explanation.

Storage: pgvector embeddings generated from wardrobe images.

## Outfit Recommendation

Input: occasion, optional weather, color preference, style preference, constraints. Output: owned wardrobe items, why it works, color explanation, accessories, footwear, makeup/lipstick if available, alternatives.

Rule: non-owned items may only appear under a clearly labeled `shopping_suggestions` field.

## Smart Shopping Assistant

Input: possible purchase photo. Output: detected item details, similar owned items, matching wardrobe items, wardrobe gap assessment, compatibility score, buy/maybe/avoid recommendation, explanation.

## Virtual Try-On

Future module behind feature flag. Requires consent, full-body photo, selected garment, segmentation, pose estimation, try-on model, generated preview, and deletion controls. It must not appear as a finished production feature until previews are real.

## Privacy and Limits

AI may misclassify fabric, fit, or color under poor lighting. UI must allow correction. Store only required AI metadata and delete derived artifacts when the source image is deleted.
