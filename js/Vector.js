export class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  static sub(p1, p2) {
    return new Vector3(p2.x - p1.x, p2.y - p1.y, p1.z - p2.z);
  }
  len() {
    return Math.abs(
      Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z),
    );
  }
  mult_self(val) {
    this.x *= val;
    this.y *= val;
    this.z *= val;
  }

  mult(val) {
    return new Vector3(this.x * val, this.y * val, this.z * val);
  }
  dist(p1) {
    return Vector3.sub(p1, new Vector3(this.x, this.y, this.z)).len();
  }
  static dist(p1, p2) {
    return Vector3.sub(p1, p2).len();
  }
  static mult(p1, val) {
    return new Vector3(p1.x * val, p1.y * val, p1.z * val);
  }
  static add(p1, p2) {
    return new Vector3(p2.x + p1.x, p2.y + p1.y, p1.z + p2.z);
  }
  static sub(p1, p2) {
    return new Vector3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
  }
  normalize() {
    const factor = 1 / this.len();
    return new Vector3(this.x * factor, this.y * factor);
  }
  add_force(direction, force) {
    this.x += direction.x * force;
    this.y += direction.y * force;
    this.z += direction.z * force;
  }
  mirror() {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
  }
  static rotate(v = null, rot) {
    if (v == null) {
      v = new Vector3(0, 1, 0);
    }
    let rotation=new Vector3(rot.x,rot.y,rot.z)
    /*
     * x=
     * [1 0 0]
     * [0 cos -sin]
     * [0 sin cos]
     * y=
     * [cos 0 -sin]
     * [0 1 0]
     * [sin 0 cos]
     * z=
     * [cos sin 0]
     * [-sin cos 0]
     * [0 0 1]
     * */

    const cos = Math.cos;
    const sin = Math.sin;

    const rad = Math.PI / 180;
    rotation.x *= rad;
    rotation.y *= rad;
    rotation.z *= rad;
    /*x*/
    let x = Vector3.mtx_mul(
      [
        [1, 0, 0],
        [0, cos(rotation.x), -sin(rotation.x)],
        [0, sin(rotation.x), cos(rotation.x)],
      ],
      v,
    );
    x = Vector3.mtx_mul(
      [
        [cos(rotation.y), 0, sin(rotation.y)],
        [0, 1, 0],
        [-sin(rotation.y), 0, cos(rotation.y)],
      ],
      x,
    );
    x = Vector3.mtx_mul(
      [
        [cos(rotation.z), -sin(rotation.z), 0],
        [sin(rotation.z), cos(rotation.z), 0],
        [0, 0, 1],
      ],
      x,
    );
    return x;
  }
  static mtx_mul(mat, vec) {
    let res = [0, 0, 0];
    let def = [vec.x, vec.y, vec.z];
    for (let i = 0; i < 3; i++) {
      let m = mat[i];
      for (let a = 0; a < 3; a++) {
        res[a] += def[i] * m[a];
      }
    }

    return new Vector3(res[0], res[1], res[2]);
  }
  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }
}
