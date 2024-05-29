class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  static sub(p1, p2) {
    return new Vector2(p2.x - p1.x, p2.y - p1.y);
  }
  len() {
    return Math.abs(Math.sqrt(this.x * this.x + this.y * this.y));
  }

  dist(p1) {
    return Vector2.sub(p1, new Vector2(this.x, this.y)).len();
  }
  static dist(p1, p2) {
    Vector2.sub(p1, p2).len();
  }
}

const grid_resolution = 300;
class Cell {
  constructor(parent, index) {
    this.mng = parent;
    this.position = new Vector2();
    this.index = index;
    this.grid = new Vector2();
  }
  update_grid() {
    this.grid.x = Math.floor(this.position.x / grid_resolution);
    this.grid.y = Math.floor(this.position.y / grid_resolution);
  }
  update() {
    this.position.x=(this.position.x+(Math.random()*5-2.5))%1920;
    this.position.y=(this.position.y+(Math.random()*5-2.5))%1080;
    this.update_grid();
  }
}

class Cell_manager {
  constructor(cellcount = 10) {
    this.cell_count = cellcount;
    this.cell_list = [];
    this.init_cells();
    this.canvas = new Canvas_manager();

    this.init_loop()
    /* this.canvas.set_mouseover_cb(() => {
      this.frame_callback();
    }); */
  }


  init_loop()
{
    window.setTimeout(() => {
      this.canvas.ctx.clearRect(0, 0, 1920, 1080);
      this.frame_callback()
      
      this.init_loop()
    }, 100/60);
  }

  frame_callback() {
    const mpos = this.canvas.mouse_pos;
    let grid = [];
    for (let i = 0; i < this.cell_count; i++) {
      const cell = this.cell_list[i];
      cell.update();

      if (grid[cell.grid.x + ":" + cell.grid.y] == null) {
        grid[cell.grid.x + ":" + cell.grid.y] = [];
      }
      grid[cell.grid.x + ":" + cell.grid.y].push(cell);
              this.canvas.draw_pos(cell.position)
    }
    const keys = Object.keys(grid);
    keys.forEach((x) => {
      /**@type{Array.<Cell>}  */
      const arr = grid[x];
      

      if (arr.length > 1) {
        arr.forEach((c) => {
          arr.forEach((b) => {
            if (c.position.dist(b.position) < 1000) {
              this.canvas.draw_line(c.position, b.position);
            }
          });
        });
      }
    });
  }

  


  init_cells() {
    for (let i = 0; i < this.cell_count; i++) {
      const cell = new Cell(this, i);
      cell.position.x = Math.random() * 600;
      cell.position.y = Math.random() * 600;
      this.cell_list.push(cell);
    }
  }
}

class Canvas_manager {
  constructor() {
    /**@type{HTMLCanvasElement}  */
    this.root = document.getElementsByClassName("js-canvas")[0];
    this.root.width = 1920;
    this.root.height = 1080;
    this.ctx = this.root.getContext("2d");
    this.ctx.lineWidth = 30;
    this.mouse_pos = new Vector2();
    this.mouseover_cb = function () {};
    // this.init_event();
  }

  set_mouseover_cb(cb) {
    this, (this.mouseover_cb = cb);
  }

  init_event() {
    this.root.addEventListener("mousemove", (e) => {
      // this.ctx.clearRect(0, 0, 1920, 1080);
      this.mouse_pos.x = e.clientX;
      this.mouse_pos.y = e.clientY;
      // this.mouseover_cb();
    });
  }

  draw_line(p1, p2) {
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineWidth = 10;
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.strokeStyle = "#ff0000";
    this.ctx.stroke();
    this.ctx.lineWidth;

    /* this.ctx.strokeStyle = "blue";
    this.ctx.fillRect(p1.x, p1.y, 5, 5);
    this.ctx.fillRect(p2.x, p2.y, 5, 5); */
  }
  draw_pos(p1)
{
    this.ctx.strokeStyle = "blue";
    this.ctx.fillRect(p1.x, p1.y, 5, 5);
    
  }
}