/**
 *TODO: Prevent messages from changing order
 *
 * */
var resolution = new Vector3(
  window.visualViewport.width,
  window.visualViewport.height,
);

var grid_resolution = 150;
var disable_screen_clear = false;
class Cell {
  constructor(parent, index) {
    this.mng = parent;

    this.index = index;

    this.position = new Vector3();
    this.grid = new Vector3();
    this.momentum = new Vector3();
    this.direction = new Vector3();
    this.speed = 1;

    this.decay = 0.3;
    this.rotation = new Vector3(0, 0, Math.random() * 360);

    this.pause = false;
    this.on_mouse = false;
    this.click_callback = () => {console.log(this.index)};

    const messages = [hope, cry, question, what_i_deserve].filter(
      (x) => x.length > 0,
    );
    //const messages = [cry];
    // const messages = [cry, what_i_deserve];

    const alignment = Math.floor(Math.random() * messages.length);
    const msg = messages[alignment];
    const i = Math.floor(Math.random() * msg.length);

    // NOTE: make it so each alignment has particular color range?

    //   const colors = ["#ee1010", "#606060"];
    const colors = ["#00aaff", "#ee1010", "#f0f020", "#606060"];
    // const colors = ["#ff0000", "#00ff00", "#0000ff"];

    this.msg = new Cell_message(msg[i]);

    this.alignment = alignment;

    // NOTE: message set specific color
    this.attribute = new Cell_attribute({ color: colors[alignment] });
    // NOTE: random color
    // this.attribute = new Cell_attribute({'color':colors[i%colors.length]});
  }
  update_grid() {
    this.grid.x = Math.floor(this.position.x / grid_resolution);
    this.grid.y = Math.floor(this.position.y / grid_resolution);
  }

  update(is_constellation) {
    this.on_mouse = false;
    if (this.pause) {
      this.pause = false;
      return;
    }
    // rotate the thang by little bit
    const rad = Math.PI / 180;

    // this.rotation.x += Math.random() * 10 - 5;
    // this.rotation.y += Math.random() * 10 - 5;
    this.rotation.z += Math.random() * 10 - 5;

    // this.direction = Vector3.rotate(null, new Vector3(this.rotation.x, this.rotation.y, this.rotation.z));
    this.direction = Vector3.rotate(null, new Vector3(0, 0, this.rotation.z));

    this.momentum.x += this.direction.x * this.speed;
    this.momentum.y += this.direction.y * this.speed;
    this.momentum.z += this.direction.z * this.speed;

    // make it attracted to one under cursor
    if (this.mng.selected != null) {
      const selected = this.mng.selected;
      const local = Vector3.sub(this.position, selected.position);
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
        this.momentum.z += dir.z;
      }
    }

    if (!is_constellation) {
      this.position.x = (this.position.x + this.momentum.x) % resolution.x;
      this.position.y = (this.position.y + this.momentum.y) % resolution.y;
      this.position.z = this.position.z + this.momentum.z;
    }

    this.momentum.x *= this.decay;
    this.momentum.y *= this.decay;
    this.momentum.z *= this.decay;

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

/** Visual attributes for individual stars */
class Cell_attribute {
  constructor(attr = {}) {
    this.attr = attr;
    this.color = new Color();
    this.color.load_hex(attr["color"] ?? "#ffffff");
    this.size = attr["size"] ?? 5;
  }
  reset() {
    const attr = this.attr;

    this.color.load_hex(attr["color"] ?? "#ffffff");
    this.size = attr["size"] ?? 5;
  }

  get_color() {
    return this.color.to_hex_color();
  }
  get_size() {
    return this.size;
  }
}
/**Message and formatting attributes  */
class Cell_message {
  constructor(text = "") {
    this.text = text;
    this.color = "black";
    this.classList = [];
  }
  get_text() {
    const span = document.createElement("div");
    span.innerHTML = this.text;
    span.style.color = this.color;
    span.style.marginLeft = "5px";
    this.classList.forEach((x) => {
      span.classList.add(x);
    });
    return span;
  }
}

/**Simulation manager   */
class Cell_manager {
  constructor(cellcount = 10) {
    this.cell_count = cellcount;
    this.cell_list = [];
    this.init_cells();
    this.init_bright_star();
    this.canvas = new Canvas_manager();
    this.line_range = 200;
    this.is_constellation = false;

    this.show_grid = false;

    this.init_loop();
    this.popup = document.getElementById("popup");
    this.selected = null;
    Cell_manager.mng = this;
  }

  init_loop() {
    let speed = 6;
    if (navigator.userAgent.indexOf("Firefox") > -1) {
      speed *= 10;
    }
    window.setTimeout(() => {
      if (!disable_screen_clear) {
        this.canvas.ctx.clearRect(0, 0, resolution.x, resolution.y);
      }
      if (this.show_grid) {
        this.canvas.draw_grid();
      }
      this.frame_callback();

      this.init_loop();
    }, 100 / speed);
  }

  /**Per frame callback  */
  frame_callback() {
    this.update_cell();
    this.update_cell_grid();
    this.selected = null;

    /**clear the popup  */
    this.popup.innerText = "";
    this.popup.style.display = "none";
    const mpos = this.canvas.mouse_pos;
    const mgrid = this.canvas.mouse_grid;
    const index = mgrid.x + ":" + mgrid.y;

    this.canvas.root.style.cursor = "";

    if (this.grid[index] != null) {
      const frag = document.createDocumentFragment();
      /**@type{Array.<Cell>}  */
      const arr = this.grid[index];
      let hit = false;
      /** check if a star is close to the mouse and if so display the text*/
      arr.forEach((cell) => {
        const dist = mpos.dist(
          new Vector3(cell.position.x, cell.position.y, 0),
        );
        // if (dist < cell.attribute.size*2) {
        if (dist < cell.attribute.size * 2) {
          cell.pause = true;
          cell.attribute.size = 15;
          cell.on_mouse = true;
          this.selected = cell;
          frag.appendChild(cell.msg.get_text());
          hit = true;
        }
      });
      if (hit) {
        this.canvas.root.style.cursor = "pointer";
        this.popup.style.left = mpos.x + "px";
        this.popup.style.top = mpos.y + "px";
        this.popup.style.display = "";
        this.popup.append(frag);
      }
    }

    // Actual rendering
    this.display_line();
    this.display_cell();
  }

  /**Call update function on every stars  */
  update_cell() {
    for (let i = 0; i < this.cell_count; i++) {
      const cell = this.cell_list[i];
      cell.update(this.is_constellation);
      // this.canvas.draw_line( cell.position, Vector3.add(cell.position, cell.momentum.normalize().mult(15)), "#ff0000", 2,);
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
        // 2+(((Math.max(-100,Math.min(cell.position.z,100)))+100)/200)*3,
      );
      cell.attribute.reset();
    }
  }

  /**Update star position on grid  */
  update_cell_grid() {
    this.grid = [];
    for (let i = 0; i < this.cell_count; i++) {
      const cell = this.cell_list[i];

      if (this.grid[cell.grid.x + ":" + cell.grid.y] == null) {
        this.grid[cell.grid.x + ":" + cell.grid.y] = [];
      }
      this.grid[cell.grid.x + ":" + cell.grid.y].push(cell);
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

              // check if 2 points are close enough
              if (distance < this.line_range) {
                const color = Color.average(
                  c.attribute.color,
                  b.attribute.color,
                );
                const op = Math.floor(
                  (1 - distance / this.line_range) * 255,
                ).toString(16);

                color.a = op;

                if (
                  c == this.selected ||
                  b == this.selected ||
                  !this.is_constellation
                ) {
                  this.canvas.draw_line(
                    c.position,
                    b.position,
                    // "#ffffff" + op,
                    color.to_hex_color(),
                    Math.floor(distance / (this.line_range / 4)),
                  );
                }
              }
            }
          });
        });
      }
    });
  }

  /**List initialization + Initial star position randomization */
  init_cells() {
    for (let i = 0; i < this.cell_count; i++) {
      const cell = new Cell(this, i);
      cell.position.x = Math.random() * resolution.x;
      cell.position.y = Math.random() * resolution.y;
      // cell.position.z = Math.random() * resolution.y;
      // cell.position.z = (Math.random() * 2)>1?100:-100;
      this.cell_list.push(cell);
    }
  }
  init_bright_star() {
    /**@type{Cell}  */
    const star = this.cell_list[0];
    star.decay = 0;
    star.attribute.attr["size"] = 35;
    star.attribute.color.load_hex("#0000ff");
    star.msg = new Cell_message(
      `<a style="margin-right:20px" href="./bio.html" target="_blank">Welcome to my site!<br>Heres my bio.</a>`,
    );
    star.msg.classList.push("pointer-all");
    star.msg.classList.push("right-10");
    this.cell_list[0] = star;
    star.click_callback=()=>{
      console.log(9999999999999999999)
      const url=new URL(window.location.href)
      const path=url.href.split("/")
      path.pop()
      window.location.href=path.join("/")+"/bio.html"
    }
  }
  click_handler() {
    this.cell_list
      .filter((x) => {
        return x.on_mouse;
      })
      .forEach((x) => x.click_callback());
  }
}

/**Renderer. Just a wrapper for canvas functions and mouse position detection */
class Canvas_manager {
  constructor() {
    /**@type{HTMLCanvasElement}  the canvas element*/
    this.root = document.getElementsByClassName("js-canvas")[0];
    this.root.width = resolution.x;
    this.root.height = resolution.y;
    this.ctx = this.root.getContext("2d");
    this.ctx.lineWidth = 30;
    this.mouse_pos = new Vector3();
    this.mouse_grid = new Vector3();
    this.mouseover_cb = function () {};
    this.init_event();
  }

  /**obsolete. meant for calling function on mouse movement */
  set_mouseover_cb(cb) {
    this.mouseover_cb = cb;
  }

  /**Updates mouse position  */
  init_event() {
    this.root.addEventListener("mousemove", (e) => {
      this.mouse_pos.x = e.clientX;
      this.mouse_pos.y = e.clientY;
      this.mouse_grid.x = Math.floor(this.mouse_pos.x / grid_resolution);
      this.mouse_grid.y = Math.floor(this.mouse_pos.y / grid_resolution);
    });
    this.root.addEventListener("click", (e) => {
      Cell_manager.mng.click_handler();
    });
  }

  /**Humble function to draw a line between 2 points. Such a good girl.  */
  draw_line(p1, p2, color, thickness = 3) {
    this.ctx.lineWidth = thickness;
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.stroke();
    this.ctx.fill();
  }

  /**A diligent function to draw a little square around stars. She's dating the line function. Also a good girl. */
  draw_pos(p1, color = "white", size = 5) {
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(p1.x - size / 2, p1.y - size / 2, size, size);
  }

  /**A function to visualize the grid. She's also dating all of them.  */
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
