const fs = require('fs');
const path = require('path');

class SetExtractor {
    constructor(folder='sets') {
        this.folder = process.cwd() + "/" + `src/${folder}`
    }

    extract(remove_accents=true) {
        this.remove_accents = remove_accents

        this.extract_sets_content()
        Object.entries(this.sets).map(([set_name, set_values]) => {
            let cleaned_values = set_values.map(text => this.clean_text(text));
            this.sets[set_name] = cleaned_values;
        })

        return this.sets
    }

    extract_sets_content() {
        /** Docs:
         * returns key-value pairs containing {set_filename: [list of rows filename's content]}, ex:
         *  {
                greetings: ['oi', 'bom dia']
            }
         */
        this.sets = {}
        const files = fs.readdirSync(this.folder)
        files.forEach(filename => {
            let file_path = this.folder + "/" + filename
            let file_values = fs.readFileSync(file_path, 'utf8').split('\n')
            filename = filename.replace('.txt', '')
            this.sets[filename] = file_values
        })
    }

    clean_text(text) {
        /** Documentação:
         * > text = 'OlÁ!!, tudo bem? Chão çabão. Removida A!@#!%$!.,; ,;,/   ||| pontuação; os espaços         extras e os acentos'
         * > new extractor.FileExtractor().clean_text(text)
            OUTPUT: 'OlA tudo bem Chao cabao Removida a pontuacao os espacos extras e os acentos'
         */
        this.text = text;
        this.text = this.text;
        if (this.remove_accents) {this.text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, "")}
        
        this.remove_punctuation()
        this.remove_extra_spaces()

        return this.text.toLowerCase()
    }

    remove_extra_spaces() {
        this.text = this.text.replace(/\s+/g,' ').trim()
    }
    remove_punctuation() {
        var punctuation_regex = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
        this.text = this.text.replace(punctuation_regex, '')
    }
}

module.exports = {SetExtractor}