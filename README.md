[![Deploy to GitHub Pages](https://github.com/antjowie/stella-sora-build/actions/workflows/deploy.yml/badge.svg)](https://github.com/antjowie/stella-sora-build/actions/workflows/deploy.yml)
# Stella Sora build
A [website](https://antjowie.github.io/stella-sora-build/) to create, store and share custom builds for Stella Sora, as well as view potentials of all Trekkers.

## Roadmap
- [x] extract data and generate database
- [x] build editor with import and export
- [x] save builds locally
- [] parse potential values/params instad of noting X and Y.
- [] integration with game to track build during ascension and tell u which option to take
- [] builds database/browser where users can publish their builds

## Credits
- Hiro420 for providing game data used to generate database [GitHub](https://github.com/Hiro420/StellaSoraData.git), licensed under the GNU General Public License v3.0. The JSON files are fetched in `src/database.ts` and are incorporated in accordance with the license terms.
- Miraheze for providing character portraits [Miraheze](https://stellasora.miraheze.org/wiki/Category:Characters)

## License
This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html). See the [LICENSE](./LICENSE) file for full details.

By using or modifying this project, you agree to the terms of the GPLv3, including the requirement to credit original authors and share derivative works under the same license.
