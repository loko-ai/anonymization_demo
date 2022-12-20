import spacy

nlp = spacy.load("it_nerIta_trf")
doc = nlp("Il signor Giovanni Rossi si reca al mare in via capitan consalvo 23, Roma")

m = {}
for e in doc.ents:
    print(e.text, e.label_, e.start, e.end)
    for i in range(e.start, e.end):
        m[i] = True
out = []
for i, e in enumerate(doc):
    if i in m:
        out.append("******")
    else:
        out.append(e.text)

print(" ".join(out))
