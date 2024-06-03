var resolution = new Vector2(
  window.visualViewport.width,
  window.visualViewport.height,
);

var grid_resolution = 200;

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

    const is_hope = Math.random() < 0.5;
    const msg = [hope, cry][is_hope ? 1 : 0];
    const i = Math.floor(Math.random() * msg.length);


    /* if(is_hope)
  {
      var r=Math.floor(125+(Math.random())*127)
      var g=Math.floor(125+(Math.random())*127)
      var b=Math.floor(125+(Math.random())*127)
    }else{
      
      var r=Math.floor((Math.random())*127)
      var g=Math.floor((Math.random())*127)
      var b=Math.floor((Math.random())*127)
    } */
    // const color="#"+r.toString(16)+g.toString(16)+b.toString(16)

    
    const colors = ["#00aaff", "#ff0000"];
    this.msg = new Cell_message(msg[i]);

    this.alignment = is_hope;
    // this.attribute = new Cell_attribute({ color: color });
    this.attribute = new Cell_attribute({ color: colors[is_hope ? 1 : 0] });
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

    this.direction.x = Math.sin(this.theta * rad);
    this.direction.y = Math.cos(this.theta * rad);

    this.momentum.x += this.direction.x * this.speed;
    this.momentum.y += this.direction.y * this.speed;

    if (this.mng.selected != null) {
      const selected = this.mng.selected;
      const local = Vector2.sub(this.position, selected.position);
      const len = local.len();
      const dir = local.normalize().mult(1 * (50 / len));
      if (this.alignment != selected.alignment) {
        dir.mirror();
      }
      this.momentum.add_force(dir, 1);
      this.momentum.x += dir.x;
      this.momentum.y += dir.y;
    }

    this.theta += Math.random() * 10 - 5;

    this.position.x = (this.position.x + this.momentum.x) % resolution.x;
    this.position.y = (this.position.y + this.momentum.y) % resolution.y;

    this.momentum.x *= this.decay;
    this.momentum.y *= this.decay;

    this.update_grid();
  }
}

class Cell_attribute {
  constructor(attr = {}) {
    this.attr = attr;
    this.color = attr["color"] ?? "#ffffff";
    this.opacity = attr["opacity"] ?? 255;
    this.size = attr["size"] ?? 5;
  }
  reset() {
    const attr = this.attr;
    this.color = attr["color"] ?? "#ffffff";
    this.opacity = attr["opacity"] ?? 255;
    this.size = attr["size"] ?? 5;
  }
  get_color() {
    return this.color + this.opacity.toString(16);
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
    keys.forEach((x) => {
      /**@type{Array.<Cell>}  */
      const arr = this.grid[x];
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
                c.attribute.opacity = op;
                this.canvas.draw_line(
                  c.position,
                  b.position,
                  // "#ffffff" + op,
                  c.attribute.get_color(),
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
