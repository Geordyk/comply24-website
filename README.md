# Comply24 website — testomgeving

Statische site, gegenereerd uit de bouwpipeline (`mk4.py`). Dit is de **testversie**:
`robots.txt` staat dicht en elke pagina heeft `noindex`, ook via de `X-Robots-Tag`-header in `vercel.json`.

- Nederlands op de hoofdadressen, Engels onder `/en/`.
- Elke release is één commit; de versie staat in het commitbericht.
- De productieversie (met indexering) wordt apart als zip opgeleverd aan de webbeheerder.
