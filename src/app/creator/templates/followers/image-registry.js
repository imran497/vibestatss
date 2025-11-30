/**
 * Image Registry
 * Configurable list of available images for the creator
 * Easy to extend with new images without touching component logic
 */

export const IMAGE_CATEGORIES = {
  NONE: 'none',
  TWITTER: 'twitter',
  CUSTOM: 'custom'
};

export const AVAILABLE_IMAGES = [
  {
    id: 'x-black',
    imagePath: '/platforms/x-black.png',
    category: IMAGE_CATEGORIES.TWITTER,
    name: 'Black',
    preview: {
      backgroundColor: '#ffffff' // Show on white background
    }
  },
  {
    id: 'x-white',
    imagePath: '/platforms/x-white.png',
    category: IMAGE_CATEGORIES.TWITTER,
    name: 'White',
    preview: {
      backgroundColor: '#0f172a' // Show on dark background
    }
  }
  // Add more images here as needed
  // Example:
  // {
  //   id: 'instagram-gradient',
  //   imagePath: '/platforms/instagram-gradient.png',
  //   category: 'instagram',
  //   name: 'Gradient',
  //   preview: { backgroundColor: '#ffffff' }
  // }
];

export const CATEGORY_LABELS = {
  [IMAGE_CATEGORIES.NONE]: 'None',
  [IMAGE_CATEGORIES.TWITTER]: 'X (Twitter)',
  [IMAGE_CATEGORIES.CUSTOM]: 'Custom Image'
};

/**
 * Get images by category
 */
export function getImagesByCategory(category) {
  if (category === IMAGE_CATEGORIES.NONE || category === IMAGE_CATEGORIES.CUSTOM) {
    return [];
  }
  return AVAILABLE_IMAGES.filter(img => img.category === category);
}

/**
 * Get image by ID
 */
export function getImageById(id) {
  return AVAILABLE_IMAGES.find(img => img.id === id);
}

/**
 * Get all available categories (excluding NONE and CUSTOM)
 */
export function getImageCategories() {
  return Object.keys(IMAGE_CATEGORIES)
    .filter(key => key !== 'NONE' && key !== 'CUSTOM')
    .map(key => ({
      value: IMAGE_CATEGORIES[key],
      label: CATEGORY_LABELS[IMAGE_CATEGORIES[key]]
    }));
}
