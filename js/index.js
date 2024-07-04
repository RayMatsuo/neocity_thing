window.addEventListener("load", () => {
  const grid_visualization = document.getElementById("grid_visualization");
  const grid_size = document.getElementById("grid_size");
  const line_range = document.getElementById("line_range");
  const hide_ui = document.getElementById("hide_ui");
  const control = document.getElementById("control");
  const main_text = document.getElementById("main_text");
  const no_screen_clear = document.getElementById("no_screen_clear");
  const constellation = document.getElementById("constellation");

  var cell_count = 150;
  if (window.visualViewport.width < 750) {
    cell_count = 50;

    grid_resolution = 150;
  }
  var mng = new Cell_manager(cell_count);

  // Grid button
  mng.show_grid = grid_visualization.checked;
  grid_visualization.onchange = () => {
    mng.show_grid = grid_visualization.checked;
  };

  // Line range
  line_range.value = mng.line_range;
  line_range.onchange = () => {
    mng.line_range = line_range.value;
  };

  // Grid Size
  grid_size.value = grid_resolution;
  grid_size.onchange = () => {
    grid_resolution = Math.max(grid_size.value, 100);
  };

  // Dynamic resolution update
  window.onresize = () => {
    resolution.x = window.visualViewport.width;
    resolution.y = window.visualViewport.height;
    mng.canvas.root.width = resolution.x;
    mng.canvas.root.height = resolution.y;
  };

  // Hide UI
  hide_ui.onchange = () => {
    const display = hide_ui.checked ? "none" : "";
    main_text.style.display = display;
    control.style.display = display;
  };

  // Disable Screen Clear
  no_screen_clear.checked = false;
  no_screen_clear.onchange = () => {
    disable_screen_clear = no_screen_clear.checked;
  };

  constellation.checked = false;

  constellation.onchange = () => {
    mng.is_constellation = constellation.checked;
  };
});
