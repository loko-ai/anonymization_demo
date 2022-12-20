import logging
import urllib.parse
from io import BytesIO

import requests
from flask import Flask, request, jsonify
from loko_extensions.business.decorators import extract_value_args
from loko_extensions.model.components import Component, save_extensions, Input

import fitz

app = Flask("anonymization", static_url_path="/web", static_folder="/frontend/dist")

pdf = Component("pdf_reader", inputs=[Input("file", service="pdf/text"), Input("url", service="pdf/url")])

save_extensions([pdf])


@app.route("/pdf/text", methods=["POST"])
@extract_value_args(request, file=True)
def pdf_text(value, args):
    buff = BytesIO()
    value.save(buff)
    n = buff.tell()
    buff.seek(0)
    doc = fitz.open("pdf", buff)
    text = []
    for page in doc:
        text.append(page.get_text())
    return jsonify(" ".join(text))


@app.route("/pdf/url", methods=["POST"])
@extract_value_args(request)
def pdf_url(value, args):
    value = urllib.parse.unquote(value)
    raw = requests.get(value).content
    buff = BytesIO()
    buff.write(raw)
    buff.seek(0)

    doc = fitz.open("pdf", buff)
    text = []
    for page in doc:
        text.append(page.get_text().strip())
    return jsonify(" ".join(text))


if __name__ == "__main__":
    app.run("0.0.0.0", 8080)
