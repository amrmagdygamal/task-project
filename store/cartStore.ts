import { create } from 'zustand';

interface CartItem {
  venue_id: string;
  name: string;
  dayprice: number;
  startDate: string;
  endDate: string;
  image_url?: string;
}

interface CartState {
  cart: CartItem[];
  loading: boolean;
  stripeUrl: string | null;
  setCart: (cart: CartItem[]) => void;
  setLoading: (loading: boolean) => void;
  setStripeUrl: (url: string | null) => void;
  reset: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  loading: false,
  stripeUrl: null,
  setCart: (cart) => set({ cart }),
  setLoading: (loading) => set({ loading }),
  setStripeUrl: (stripeUrl) => set({ stripeUrl }),
  reset: () => set({ cart: [], loading: false, stripeUrl: null }),
}));

// --- UI/UX improvement suggestions for consuming pages/components ---
// 1. Use more whitespace and padding for clarity.
// 2. Use Tailwind's focus-visible and ring utilities for accessibility.
// 3. Add subtle hover/active states to interactive elements.
// 4. Use consistent rounded corners and shadow for cards and forms.
// 5. Use color for section headers and call-to-action buttons.
// 6. Add loading skeletons or spinners for async data.
// 7. Use responsive grid layouts for lists and cards.
// 8. Add aria-labels and roles to important interactive elements for accessibility.
// 9. Use transition-all and duration utilities for smooth UI feedback.
// 10. Consider using toast notifications for success/error instead of alert().
// 11. Use visually distinct error/success states for form feedback.
// 12. Add mobile-friendly touch targets and spacing.
// 13. Use font-semibold/bold for important labels and actions.
// 14. Add smooth scroll or focus to error fields on validation failure.
// 15. Use placeholder and helper text for form fields.
// 16. Add animated transitions for modal/dialog open/close.
// 17. Use icons for actions (edit, delete, download, etc.) for clarity.
// 18. Provide visual feedback for async actions (button loading spinners, etc.).
// 19. Use a11y best practices: aria-live for dynamic content, roles for lists, etc.
// 20. Test with keyboard navigation and screen readers for accessibility.
// 21. Add toast/snackbar notifications for cart actions and error feedback.
// 22. Use a11y color contrast for all text and backgrounds.
// 23. Add focus management for modals and dialogs.
// 24. Use responsive font sizes and spacing for mobile.
// 25. Add helper text for date pickers and required fields.
// 26. Document all UI/UX conventions in README for team consistency.
// 27. Regularly test on multiple devices and browsers for cross-compatibility.
