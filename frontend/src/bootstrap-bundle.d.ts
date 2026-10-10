// The Bootstrap bundle main.tsx loads for the data-API. It's a UMD file without types; only what the app calls
declare module 'bootstrap/dist/js/bootstrap.bundle.min.js' {
  interface OffcanvasInstance {
    hide(): void
  }
  const bootstrap: {
    Offcanvas: { getOrCreateInstance(element: Element): OffcanvasInstance }
  }
  export default bootstrap
}
