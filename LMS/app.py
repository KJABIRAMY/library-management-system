from flask import Flask, render_template, request, redirect, session
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = 'secret123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ecommerce.db'
db = SQLAlchemy(app)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    price = db.Column(db.Float)

@app.before_first_request
def create_tables():
    db.create_all()
    if not Product.query.first():
        db.session.add_all([
            Product(name="T-shirt", price=299),
            Product(name="Shoes", price=999),
            Product(name="Bag", price=499)
        ])
        db.session.commit()

@app.route('/')
def index():
    products = Product.query.all()
    return render_template('index.html', products=products)

@app.route('/add-to-cart', methods=['POST'])
def add_to_cart():
    product_id = request.form['product_id']
    cart = session.get('cart', [])
    cart.append(int(product_id))
    session['cart'] = cart
    return redirect('/')

@app.route('/cart')
def cart():
    cart_ids = session.get('cart', [])
    products = Product.query.filter(Product.id.in_(cart_ids)).all()
    total = sum(p.price for p in products)
    return render_template('cart.html', products=products, total=total)

if __name__ == '__main__':
    app.run(debug=True)
