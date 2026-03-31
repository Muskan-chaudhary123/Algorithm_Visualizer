from flask import Flask, render_template, request, jsonify,url_for , redirect
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ------------------ DATABASE INIT ------------------
def init_db():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            algorithm TEXT,
            category TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

# ------------------ ROUTES ------------------
@app.route("/")
def home():
    return render_template("index.html")

# ----------------------------------------Sorting Routes-----------------------------------------

@app.route("/sorting")
def sorting():
    return render_template("array/sorting.html")

@app.route("/read/sort")
def sort_read():
    return render_template("read/sortread.html")

# ----------------------------------------Searching Routes-----------------------------------------

@app.route("/searching")
def searching():
    return render_template("array/searching.html")

@app.route("/read/search")
def search_read():
    return render_template("read/searchread.html")

# ----------------------------------------Linked List Routes-----------------------------------------

@app.route("/linkedlist")
def linkedlist():
    return render_template("array/linked_list.html")

@app.route("/read/linkedlist")
def linkedlist_read():
    return render_template("read/linkedread.html")


# ----------------------------------------Tree Routes-----------------------------------------

@app.route("/bst")
def bst():
    return render_template("tree/bst.html")

@app.route("/read/bst")
def bst_read():
    return render_template("read/bstread.html")

@app.route("/treetraversal")
def treetraversal():
    return render_template("tree/treetraversal.html")

@app.route("/read/treetraversal")
def treetraversal_read():
    return render_template("read/treetraversalRead.html")

@app.route("/heap")
def heap():
    return render_template("tree/heap.html")

@app.route("/read/heap")
def heap_read():
    return render_template("read/heapRead.html")

# ----------------------------------------Graph Routes-----------------------------------------

@app.route("/graph/traversal")
def graph_traversal():
    return render_template("graph/graph_traversal.html")

@app.route("/read/graphtraversal")
def graph_traversal_read():
    return render_template("read/graph_traversalRead.html")


@app.route("/graph/mst")
def graph_mst():
    return render_template("graph/graph_mst.html")

@app.route("/read/mst")
def mst_read():
    return render_template("read/mstRead.html")


# ------------------ RUN ------------------
if __name__ == "__main__":
    init_db()
    app.run(debug=True)
