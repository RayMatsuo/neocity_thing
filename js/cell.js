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
  static mult(p1, val) {
    return new Vector2(p1.x * val, p1.y * val);
  }
  static add(p1, p2) {
    return new Vector2(p2.x + p1.x, p2.y + p1.y);
  }
}

var resolution=new Vector2(window.visualViewport.width,window.visualViewport.height);

var grid_resolution = 200;
class Cell {
  constructor(parent, index) {
    this.mng = parent;
    this.position = new Vector2();
    this.momentum = new Vector2();
    this.direction = new Vector2();
    this.decay = 0.6;
    this.theta = Math.random() * 360;
    this.index = index;
    this.grid = new Vector2();
  }
  update_grid() {
    this.grid.x = Math.floor(this.position.x / grid_resolution);
    this.grid.y = Math.floor(this.position.y / grid_resolution);
  }
  update() {
    const rad = Math.PI / 180;

    this.direction.x = Math.sin(this.theta * rad);
    this.direction.y = Math.cos(this.theta * rad);

    this.momentum.x = this.direction.x * 1;
    this.momentum.y = this.direction.y * 1;

    this.theta += Math.random() * 10 - 5;

    this.position.x = (this.position.x + this.momentum.x) % resolution.x;
    this.position.y = (this.position.y + this.momentum.y) % resolution.y;

    this.momentum.x *= this.decay;
    this.momentum.y *= this.decay;

    this.update_grid();
  }
}

class Cell_manager {
  constructor(cellcount = 10) {
    this.cell_count = cellcount;
    this.cell_list = [];
    this.init_cells();
    this.canvas = new Canvas_manager();
    this.line_range = 200;

    this.show_grid = false;

    this.init_loop();
    /* this.canvas.set_mouseover_cb(() => {
      this.frame_callback();
    }); */
  }

  init_loop() {
    window.setTimeout(() => {
      this.canvas.ctx.clearRect(0, 0, resolution.x, resolution.y);
      if (this.show_grid) {
        this.canvas.draw_grid();
      }
      this.frame_callback();

      this.init_loop();
    }, 100 / 60);
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
      this.canvas.draw_pos(cell.position);
      this.canvas.draw_line(
        cell.position,
        Vector2.add(cell.position, Vector2.mult(cell.direction, 20)),
        "#ff0000",
        1,
      );
    }
    const keys = Object.keys(grid);
    keys.forEach((x) => {
      /**@type{Array.<Cell>}  */
      const arr = grid[x];
      const comp = [];

      if (arr.length > 1) {
        arr.forEach((c) => {
          arr.forEach((b) => {
            if (c.index != b.index && comp[c.index + ":" + b.index] == null) {
              comp[c.index + ":" + b.index] = 1;
              const distance = c.position.dist(b.position);
              if (distance < this.line_range) {
                const op = Math.floor(
                  (1 - distance / this.line_range) * 255,
                ).toString(16);
                this.canvas.draw_line(
                  c.position,
                  b.position,
                  "#ffffff" + op,
                  Math.floor(distance / (this.line_range / 4)),
                );
              }
            }
          });
        });
      }
    });
  }

  init_cells() {
    for (let i = 0; i < this.cell_count; i++) {
      const cell = new Cell(this, i);
      cell.position.x = Math.random() * resolution.x;
      cell.position.y = Math.random() * resolution.y;
      this.cell_list.push(cell);
    }
  }
}

class Canvas_manager {
  constructor() {
    /**@type{HTMLCanvasElement}  */
    this.root = document.getElementsByClassName("js-canvas")[0];
    this.root.width = resolution.x;
    this.root.height = resolution.y;
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

  draw_line(p1, p2, color, thickness = 3) {
    this.ctx.lineWidth = thickness;
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.stroke();

    /* this.ctx.strokeStyle = "blue";
    this.ctx.fillRect(p1.x, p1.y, 5, 5);
    this.ctx.fillRect(p2.x, p2.y, 5, 5); */
  }
  draw_pos(p1, p2) {
    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";
    const size = 5;
    this.ctx.fillRect(p1.x - size / 2, p1.y - size / 2, size, size);
  }
  draw_grid() {
    this.ctx.lineWidth = 10;
    this.ctx.strokeStyle = "#0000ff";
    const xsize = grid_resolution;
    const ysize = grid_resolution;
    for (let x = 0; x < resolution.x / grid_resolution; x++) {
      for (let y = 0; y <resolution.y  / grid_resolution; y++) {
        /* this.ctx.moveTo(xsize*x, ysize*y)
        this.ctx.lineTo(xsize*(x+1), ysize*y)
        this.ctx.lineTo(xsize*(x+1), ysize*(y+1))
        this.ctx.lineTo(xsize*(x), ysize*(y+1)) */

        // this.ctx.fillStyle="#a0a0ff10"
        // this.ctx.fillRect(xsize*x,xsize*y,xsize,ysize)
        //
        this.ctx.fillStyle = "#ff000020";
        this.ctx.fillRect(
          xsize * x + 10,
          xsize * y + 10,
          xsize - 10,
          ysize - 10,
        );
      }
    }
  }
}
