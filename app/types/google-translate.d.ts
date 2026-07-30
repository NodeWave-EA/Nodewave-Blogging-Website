export {};

declare global {
  // Augment the global `google` namespace so it merges with Google Maps types
  namespace google {
    namespace translate {
      class TranslateElement {
        constructor(
          options?: {
            pageLanguage?: string;
            includedLanguages?: string;
            layout?: number;
            autoDisplay?: boolean;
          },
          elementId?: string
        );

        static InlineLayout: {
          SIMPLE: number;
          HORIZONTAL: number;
          VERTICAL: number;
        };
      }
    }
  }

  // Add custom callback function to window
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Window {
    googleTranslateElementInit?: () => void;
  }
}
