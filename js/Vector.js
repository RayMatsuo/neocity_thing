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
   mult_self(val) {
    this.x*=val
    this.y*=val
  }


   mult(val) {
   return new Vector2(this.x*val,this.y*val)
  }
  dist(p1) {
    return Vector2.sub(p1, new Vector2(this.x, this.y)).len();
  }
  static dist(p1, p2) {
    return Vector2.sub(p1, p2).len();
  }
  static mult(p1, val) {
    return new Vector2(p1.x * val, p1.y * val);
  }
  static add(p1, p2) {
    return new Vector2(p2.x + p1.x, p2.y + p1.y);
  }
  static sub(p1, p2) {
    
    return new Vector2(p2.x - p1.x, p2.y - p1.y);
  }
  normalize()
  {
    const factor=1/this.len()
    return new Vector2(this.x*factor,this.y*factor)
  }
}
