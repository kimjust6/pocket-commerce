import sqlite3
import json
import time

conn = sqlite3.connect('pb_data/data.db')
cur = conn.cursor()

# 1. Categories
categories = [
    ('elqkjruu9kbju6r', 'Birthday', 'birthday', '', ''),
    ('79xiog9llkcbd6u', 'Animals', 'animals', '', ''),
    ('qcnp1ahols5vb2i', 'Food & Drink', 'food', '', ''),
    ('108izdo9nabniu0', 'Love & Romance', 'love', '', ''),
    ('cat000000000005', 'Thank You', 'thank-you', '', ''),
    ('cat000000000006', 'Anniversary', 'anniversary', '', '')
]

for cat in categories:
    cur.execute("INSERT OR REPLACE INTO categories (id, name, slug, parent, image) VALUES (?, ?, ?, ?, ?)", cat)

print("Seeded categories.")

# 2. Products
products = [
    # Birthday
    ('prd000000000001', 'Hilarious Toast Birthday Card', 'hilarious-toast-birthday-card', 'A funny toast pun greeting card printed on premium 100% recycled cardstock.', 'active', 'elqkjruu9kbju6r', json.dumps(["/card-food.webp", "https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=600"])),
    ('prd000000000002', 'Festive Birthday Candles Card', 'festive-birthday-candles-card', 'Bright and cheerful birthday candle card for friends and family.', 'active', 'elqkjruu9kbju6r', json.dumps(["/card-birthday.webp", "https://images.pexels.com/photos/6800085/pexels-photo-6800085.jpeg?auto=compress&cs=tinysrgb&w=600"])),
    ('prd000000000007', 'Aged to Perfection Wine Card', 'aged-to-perfection-wine-card', 'Witty wine-themed birthday card for someone celebrating another fabulous year.', 'active', 'elqkjruu9kbju6r', json.dumps(["https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=600", "https://images.pexels.com/photos/6800085/pexels-photo-6800085.jpeg?auto=compress&cs=tinysrgb&w=600"])),
    ('prd000000000008', 'Another Year Older Dino Card', 'another-year-older-dino-card', 'Cute dinosaur birthday card with custom hand-drawn illustration.', 'active', 'elqkjruu9kbju6r', json.dumps(["https://images.pexels.com/photos/6800085/pexels-photo-6800085.jpeg?auto=compress&cs=tinysrgb&w=600", "/card-birthday.webp"])),

    # Animals
    ('prd000000000003', 'Party Puppy Greetings Card', 'party-puppy-greetings-card', 'Adorable golden retriever puppy wearing a party hat.', 'active', '79xiog9llkcbd6u', json.dumps(["/card-animals.webp", "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600"])),
    ('prd000000000009', 'You Are Purrfect Cat Card', 'you-are-purrfect-cat-card', 'Sweet cat pun greeting card with gold foil accents.', 'active', '79xiog9llkcbd6u', json.dumps(["https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=600", "/card-animals.webp"])),
    ('prd000000000010', 'Have a Mice Day Card', 'have-a-mice-day-card', 'Whimsical illustrated mouse holding a tiny balloon.', 'active', '79xiog9llkcbd6u', json.dumps(["https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600", "https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=600"])),
    ('prd000000000011', 'Beary Happy Birthday Card', 'beary-happy-birthday-card', 'Warm teddy bear illustration card with kraft envelope.', 'active', '79xiog9llkcbd6u', json.dumps(["/card-animals.webp", "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600"])),

    # Food & Drink
    ('prd000000000004', 'Avocado Toast Love Card', 'avocado-toast-love-card', 'You guac my world avocado pun card.', 'active', 'qcnp1ahols5vb2i', json.dumps(["/card-food.webp", "https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=600"])),
    ('prd000000000012', 'Donut Forget My Bday Card', 'donut-forget-my-bday-card', 'Colorful sprinkled donut pun greeting card.', 'active', 'qcnp1ahols5vb2i', json.dumps(["https://images.pexels.com/photos/3771110/pexels-photo-3771110.jpeg?auto=compress&cs=tinysrgb&w=600", "/card-food.webp"])),
    ('prd000000000013', 'I Loaf You Bread Pun Card', 'i-loaf-you-bread-pun-card', 'Cute artisan sourdough bread loaf illustration.', 'active', 'qcnp1ahols5vb2i', json.dumps(["https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=600", "https://images.pexels.com/photos/3771110/pexels-photo-3771110.jpeg?auto=compress&cs=tinysrgb&w=600"])),
    ('prd000000000014', 'Main Squeeze Lemon Card', 'main-squeeze-lemon-card', 'Vibrant lemon citrus pun card for your favorite person.', 'active', 'qcnp1ahols5vb2i', json.dumps(["/card-food.webp", "https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=600"])),

    # Love & Romance
    ('prd000000000005', 'Romantic Watercolor Hearts Card', 'romantic-watercolor-hearts-card', 'Elegant watercolor hearts for anniversaries and Valentine\'s Day.', 'active', '108izdo9nabniu0', json.dumps(["/card-love.webp", "https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&cs=tinysrgb&w=600"])),
    ('prd000000000015', 'You Rock My World Card', 'you-rock-my-world-card', 'Modern minimalist love card printed on heavy cardstock.', 'active', '108izdo9nabniu0', json.dumps(["https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&cs=tinysrgb&w=600", "/card-love.webp"])),

    # Thank You
    ('prd000000000006', 'Botanical Thank You Note Card', 'botanical-thank-you-note-card', 'Lush botanical floral leaf illustration thank you card.', 'active', 'cat000000000005', json.dumps(["/card-thankyou.webp", "https://images.pexels.com/photos/2072165/pexels-photo-2072165.jpeg?auto=compress&cs=tinysrgb&w=600"])),
    ('prd000000000016', 'Thanks a Latte Coffee Card', 'thanks-a-latte-coffee-card', 'Charming coffee cup illustration card to show your appreciation.', 'active', 'cat000000000005', json.dumps(["https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=600", "/card-thankyou.webp"]))
]

for p in products:
    cur.execute("INSERT OR REPLACE INTO products (id, name, slug, description, status, category, images) VALUES (?, ?, ?, ?, ?, ?, ?)", p)

print("Seeded products.")

# 3. Product Variants
variants = [
    ('var000000000001', 'prd000000000001', 4.99, 5.99, 50, 'SKU-TOAST-01', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000002', 'prd000000000002', 4.99, 0.0, 45, 'SKU-Bday-02', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000003', 'prd000000000003', 5.49, 0.0, 30, 'SKU-PUPPY-03', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000004', 'prd000000000004', 4.99, 0.0, 60, 'SKU-AVO-04', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000005', 'prd000000000005', 5.99, 6.99, 25, 'SKU-LOVE-05', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000006', 'prd000000000006', 4.49, 0.0, 40, 'SKU-THANKS-06', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000007', 'prd000000000007', 5.50, 0.0, 35, 'SKU-WINE-07', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000008', 'prd000000000008', 4.99, 5.50, 20, 'SKU-DINO-08', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000009', 'prd000000000009', 4.99, 0.0, 50, 'SKU-CAT-09', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000010', 'prd000000000010', 4.50, 0.0, 40, 'SKU-MICE-10', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000011', 'prd000000000011', 5.25, 0.0, 30, 'SKU-BEAR-11', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000012', 'prd000000000012', 5.00, 0.0, 55, 'SKU-DONUT-12', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000013', 'prd000000000013', 4.50, 0.0, 45, 'SKU-LOAF-13', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000014', 'prd000000000014', 4.99, 0.0, 50, 'SKU-LEMON-14', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000015', 'prd000000000015', 5.99, 6.99, 25, 'SKU-ROCK-15', json.dumps({"Format": "Single Card"}), 0.1),
    ('var000000000016', 'prd000000000016', 4.99, 0.0, 60, 'SKU-LATTE-16', json.dumps({"Format": "Single Card"}), 0.1)
]

for v in variants:
    cur.execute("INSERT OR REPLACE INTO product_variants (id, product, price, compare_at_price, stock, sku, attributes, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", v)

print("Seeded product variants.")

# 4. Reviews
cur.execute("SELECT id FROM users LIMIT 1")
u_row = cur.fetchone()
user_id = u_row[0] if u_row else 'h609qzoavvnh0vq'

reviews = [
    ('rev000000000001', 'prd000000000001', user_id, 5, 'Loved the pun!', 'My brother laughed out loud when he opened this card! High quality cardstock.', 1),
    ('rev000000000002', 'prd000000000003', user_id, 5, 'Super cute puppy card', 'The illustration is so adorable and the envelope was super sturdy.', 1),
    ('rev000000000003', 'prd000000000004', user_id, 5, 'Great anniversary card', 'Gave this to my girlfriend for our anniversary and she adored it!', 1),
    ('rev000000000004', 'prd000000000006', user_id, 4, 'Beautiful botanical details', 'Very pretty thank you card, fast shipping!', 1)
]

for r in reviews:
    cur.execute("INSERT OR REPLACE INTO reviews (id, product, user, rating, title, body, is_verified_purchase) VALUES (?, ?, ?, ?, ?, ?, ?)", r)

print("Seeded reviews.")

conn.commit()
print("Database seeding completed successfully.")
