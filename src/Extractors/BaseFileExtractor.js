
class FileExtractor {
    clean_text(text, remove_accents=true) {
        /** Documentação:
         * > text = 'OlÁ!!, tudo bem? Chão çabão. Removida A!@#!%$!.,; ,;,/   ||| pontuação; os espaços         extras e os acentos'
         * > new extractor.FileExtractor().clean_text(text)
            OUTPUT: 'OlA tudo bem Chao cabao Removida a pontuacao os espacos extras e os acentos'
         */
        if (remove_accents) {this.text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, "")}
        
        this.remove_punctuation()
        this.remove_extra_spaces()
        
        return this.text
    }

    remove_extra_spaces() {
        this.text = this.text.replace(/\s+/g,' ').trim()
    }
    remove_punctuation() {
        var punctuation_regex = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
        this.text = this.text.replace(punctuation_regex, '')
    }
}

module.exports = {FileExtractor}