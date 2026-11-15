// Minimal in-memory router: one view at a time, rendered into the root element.
// A screen is a function (root, view, app) that renders `view` into `root`.

export function createRouter(root, screens, app) {
  let view = null;

  function render() {
    const screen = screens[view.name];
    if (!screen) throw new Error(`Unknown view "${view.name}"`);
    screen(root, view, app);
  }

  return {
    get view() { return view; },
    go(next) {
      view = next;
      render();
    },
    render,
  };
}
