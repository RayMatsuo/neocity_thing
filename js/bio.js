window.addEventListener("load", () => {
  var cell_count = 100;
  if (window.visualViewport.width < 750) {
    cell_count = 50;

    grid_resolution = 150;
  }
  var mng = new Cell_manager(cell_count);

  mng.is_constellation = true;
});
