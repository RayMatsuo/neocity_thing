class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = Math.random() * 600;
    this.y = Math.random() * 600;
  }
  static sub(p1, p2) {
    return new Vector2(p2.x - p1.x, p2.y - p1.y);
  }
  len() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  dist(p1) {
    return Vector2.sub(p1, new Vector2(this.x, this.y)).len();
  }
  static dist(p1, p2) {
    Vector2.sub(p1, p2).len();
  }
}

const grid_resolution = 30;
class Cell {
  constructor(parent, index) {
    this.mng = parent;
    this.position = new Vector2();
    this.index = index;
    this.grid = new Vector2();
  }
  update_grid() {
    this.grid.x = this.position.x / 30;
    this.grid.y = this.position.y / 30;
  }
  update() {
    this.update_grid();
  }
}

class Cell_manager {
  constructor(cellcount = 10) {
    this.cell_count = cellcount;
    this.cell_list = [];
    this.init_cells();
    this.canvas = new Canvas_manager();

    this.canvas.set_mouseover_cb(() => {
      const mpos = this.canvas.mouse_pos;
      for (let i = 0; i < this.cell_count; i++) {
        const cell = this.cell_list[i];
        const dist = cell.position.dist(mpos);
        if (dist < 300) {
          this.canvas.draw_line(mpos, cell.position);
        }
      }
      this.canvas.ctx.lin;
    });
  }

  init_cells() {
    for (let i = 0; i < this.cell_count; i++) {
      this.cell_list.push(new Cell(this, i));
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
    this.init_event();
  }

  set_mouseover_cb(cb) {
    this, (this.mouseover_cb = cb);
  }

  init_event() {
    this.root.addEventListener("mousemove", (e) => {
      this.ctx.clearRect(0, 0, 1920, 1080)
      this.mouse_pos.x = e.clientX;
      this.mouse_pos.y = e.clientY;
      this.mouseover_cb();
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
  }
}
