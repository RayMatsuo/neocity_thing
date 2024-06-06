var resolution = new Vector2(
  window.visualViewport.width,
  window.visualViewport.height,
);

var grid_resolution = 150;

class Cell {
  constructor(parent, index) {
    this.mng = parent;

    this.index = index;

    this.position = new Vector2();
    this.grid = new Vector2();
    this.momentum = new Vector2();
    this.direction = new Vector2();
    this.speed = 1;

    this.decay = 0.3;
    this.theta = Math.random() * 360;

    this.pause = false;
    this.on_mouse = false;

    const alignment = Math.floor(Math.random() * 3);
    const msg = [hope, cry, question][alignment];
    const i = Math.floor(Math.random() * msg.length);

    // NOTE: make it so each alignment has particular color range?

    const colors = ["#00aaff", "#ee1010", "#f0f020"];
    // const colors = ["#ff0000", "#00ff00", "#0000ff"];
    this.msg = new Cell_message(msg[i]);

    this.alignment = alignment;
    // this.attribute = new Cell_attribute({ color: color });
    this.attribute = new Cell_attribute({ color: colors[alignment] });
    // this.attribute = new Cell_attribute({'color':colors[i%colors.length]});
  }
  update_grid() {
    this.grid.x = Math.floor(this.position.x / grid_resolution);
    this.grid.y = Math.floor(this.position.y / grid_resolution);
  }

  update() {
    this.on_mouse = false;
    if (this.pause) {
      this.pause = false;
      return;
    }
    const rad = Math.PI / 180;
    this.theta += Math.random() * 10 - 5;

    this.direction.x = Math.sin(this.theta * rad);
    this.direction.y = Math.cos(this.theta * rad);

    this.momentum.x += this.direction.x * this.speed;
    this.momentum.y += this.direction.y * this.speed;

    if (this.mng.selected != null) {
      const selected = this.mng.selected;
      const local = Vector2.sub(this.position, selected.position);
      const len = local.len();
      // if(len<500)
    {
      const dir = local.normalize().mult(1 * (50 / len));
      if (this.alignment != selected.alignment) {
        dir.mirror();
      }
      this.momentum.add_force(dir, 1);
      this.momentum.x += dir.x;
      this.momentum.y += dir.y;
      }
    }

    this.position.x = (this.position.x + this.momentum.x) % resolution.x;
    this.position.y = (this.position.y + this.momentum.y) % resolution.y;

    this.momentum.x *= this.decay;
    this.momentum.y *= this.decay;

    this.update_grid();
  }
}

class Color {
  constructor(r = 255, g = 255, b = 255, a = 255) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  to_hex_color() {
    return (
      "#" +
      this.r.toString(16).padStart(2, 0) +
      this.g.toString(16).padStart(2, 0) +
      this.b.toString(16).padStart(2, 0) +
      this.a.toString(16).padStart(2, 0)
    );
  }
  static average(c1, c2) {
    const r = Math.min(255, Math.floor((c1.r + c2.r) / 2));
    const g = Math.min(255, Math.floor((c1.g + c2.g) / 2));
    const b = Math.min(255, Math.floor((c1.b + c2.b) / 2));
    const a = Math.min(255, Math.floor((c1.a + c2.a) / 2));
    return new Color(r, g, b, a);
  }

  load_hex(hex) {
    this.r = parseInt("0x" + hex[1] + hex[2]);
    this.g = parseInt("0x" + hex[3] + hex[4]);
    this.b = parseInt("0x" + hex[5] + hex[6]);
  }
}

class Cell_attribute {
  constructor(attr = {}) {
    this.attr = attr;
    this.color = new Color();
    this.color.load_hex(attr["color"] ?? "#ffffff");
    this.opacity = attr["opacity"] ?? 255;
    this.size = attr["size"] ?? 5;
  }
  reset() {
    const attr = this.attr;

    this.color.load_hex(attr["color"] ?? "#ffffff");
    this.opacity = attr["opacity"] ?? 255;
    this.size = attr["size"] ?? 5;
  }

  merge_color(c1, c2) {
    const r = parseInt("0x" + this.color[1] + this.color[2]);
    const g = parseInt("0x" + this.color[3] + this.color[4]);
    const b = parseInt("0x" + this.color[5] + this.color[6]);
  }
  get_color() {
    return this.color.to_hex_color();
  }
  get_size() {
    return this.size;
  }
}
class Cell_message {
  constructor(text = "") {
    this.text = text;
    this.color = "black";
  }
  get_text() {
    const span = document.createElement("span");
    span.innerHTML = this.text;
    span.style.color = this.color;
    span.style.marginLeft = "5px";
    return span;
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
    this.popup = document.getElementById("popup");
    this.selected = null;
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
    this.update_cell();
    this.update_cell_grid();
    this.selected = null;

    this.popup.innerText = "";
    this.popup.style.display = "none";
    const mpos = this.canvas.mouse_pos;
    const mgrid = this.canvas.mouse_grid;

    const index = mgrid.x + ":" + mgrid.y;
    this.canvas.root.style.cursor = "";
    if (this.grid[index] != null) {
      /**@type{Array.<Cell>}  */
      const arr = this.grid[index];
      arr.forEach((cell) => {
        const dist = mpos.dist(cell.position);
        /* if (dist < 50) {
          cell.attribute.color = "#ff0000";
          cell.attribute.size = 10;
        } */
        if (dist < 10) {
          cell.pause = true;
          // cell.attribute.color = "#00ffff";
          cell.attribute.size = 15;
          cell.attribute.on_mouse = false;
          this.selected = cell;
          this.canvas.root.style.cursor = "pointer";
          this.popup.style.left = mpos.x + "px";
          this.popup.style.top = mpos.y + "px";
          this.popup.append(cell.msg.get_text());
          this.popup.style.display = "";
        }
      });
    }

    this.display_line();
    this.display_cell();
  }
  update_cell() {
    for (let i = 0; i < this.cell_count; i++) {
      const cell = this.cell_list[i];
      cell.update();
    }
  }

  display_cell() {
    for (let i = 0; i < this.cell_count; i++) {
      /**@type{Cell}  */
      const cell = this.cell_list[i];
      this.canvas.draw_pos(
        cell.position,
        cell.attribute.get_color(),
        cell.attribute.size,
      );
      cell.attribute.reset();
    }
  }

  update_cell_grid() {
    this.grid = [];
    for (let i = 0; i < this.cell_count; i++) {
      const cell = this.cell_list[i];

      if (this.grid[cell.grid.x + ":" + cell.grid.y] == null) {
        this.grid[cell.grid.x + ":" + cell.grid.y] = [];
      }
      this.grid[cell.grid.x + ":" + cell.grid.y].push(cell);
      // this.canvas.draw_pos(cell.position);
      // this.canvas.draw_line( cell.position, Vector2.add(cell.position, Vector2.mult(cell.direction, 20)), "#ff0000", 1,);
    }
  }

  display_line() {
    const keys = Object.keys(this.grid);
    // Loop thru each grid
    keys.forEach((x) => {
      /**@type{Array.<Cell>}  */
      const arr = this.grid[x];
      const comp = [];

      if (arr.length > 1) {
        // loop thru cells in grid
        arr.forEach((c) => {
          arr.forEach((b) => {
            // check if connection has already been made

            const compare = c.index < b.index;
            const left = compare ? c.index : b.index;
            const right = compare ? b.index : c.index;

            if (c.index != b.index && comp[left + ":" + right] == null) {
              comp[left + ":" + right] = true;
              const distance = c.position.dist(b.position);
              //
              // check if 2 points are close enough
              if (distance < this.line_range) {
                const color = Color.average(
                  c.attribute.color,
                  b.attribute.color,
                );
                const op = Math.floor(
                  (1 - distance / this.line_range) * 255,
                ).toString(16);
                c.attribute.opacity = op;

                color.a = op;

                this.canvas.draw_line(
                  c.position,
                  b.position,
                  // "#ffffff" + op,
                  color.to_hex_color(),
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
    this.mouse_grid = new Vector2();
    this.mouseover_cb = function () {};
    this.init_event();
  }

  set_mouseover_cb(cb) {
    this, (this.mouseover_cb = cb);
  }

  init_event() {
    this.root.addEventListener("mousemove", (e) => {
      this.mouse_pos.x = e.clientX;
      this.mouse_pos.y = e.clientY;
      this.mouse_grid.x = Math.floor(this.mouse_pos.x / grid_resolution);
      this.mouse_grid.y = Math.floor(this.mouse_pos.y / grid_resolution);
    });
  }
  draw_line(p1, p2, color, thickness = 3) {
    this.ctx.lineWidth = thickness;
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.stroke();
  }
  draw_pos(p1, color = "white", size = 5) {
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(p1.x - size / 2, p1.y - size / 2, size, size);
  }
  draw_grid() {
    this.ctx.fillStyle = "#ff000020";
    const res = grid_resolution;
    const padding = 10;
    for (let x = 0; x < resolution.x / res; x++) {
      for (let y = 0; y < resolution.y / res; y++) {
        this.ctx.fillRect(
          res * x + padding,
          res * y + padding,
          res - padding,
          res - padding,
        );
      }
    }
  }
}
