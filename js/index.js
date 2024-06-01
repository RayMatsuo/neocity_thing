window.addEventListener("load", () => {
  const grid_visualization = document.getElementById("grid_visualization");
  const grid_size = document.getElementById("grid_size");
  const line_range = document.getElementById("line_range");
  const hide_ui = document.getElementById("hide_ui");
  const control = document.getElementById("control");
  const main_text  = document.getElementById("main_text");


  var mng = new Cell_manager(150);

  mng.show_grid = grid_visualization.checked;

  grid_visualization.onchange = () => {
    mng.show_grid = grid_visualization.checked;
  };
  line_range.onchange = () => {
    mng.line_range = line_range.value;
  };

  grid_size.onchange = () => {
    grid_resolution = Math.max(grid_size.value, 100);
  };
  grid_size.value = grid_resolution;
  line_range.value = mng.line_range;

  window.onresize = () => {
    resolution.x = window.visualViewport.width;
    resolution.y = window.visualViewport.height;
    mng.canvas.root.width = resolution.x;
    mng.canvas.root.height = resolution.y;
  };


  hide_ui.onchange=()=>{
   const display= hide_ui.checked?"none":"";   
    main_text.style.display=display
    control.style.display=display
  }
});
