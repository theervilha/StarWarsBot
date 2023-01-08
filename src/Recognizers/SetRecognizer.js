const base = require('./BaseRecognizer');

class SetRecognizer extends base.BaseRecognizer {
    /**
     * The main purpose of these class functions is to return the sets that
     * satisfies the condition. So, we only have to proccess this once,
     * avoiding the use of many IF's statements
     */
    constructor (sets) {
        super()
        this.sets = sets
    }

    get_sets_by_equal(user_message) {
        /**
         * if user_message = "olá"; and if this.sets contains {'greetings': ['olá]},
         * returns { greetings: [ 'olá' ] }, 
         */
        return Object.keys(this.sets).reduce((filtered, setname) => {
            let setvalues = this.sets[setname];
            let equal_values = this.get_equals(setvalues, user_message)
            
            if (equal_values.length > 0) {
                filtered[setname] = equal_values;
            }
            return filtered
        }, {})
    }

    get_sets_by_contains(user_message) {
        /**
         * if user_message = 'olaa!!!! tudo bem? espero que sim' and if this.sets 
         * contains {'greetings': ['ola', 'tudo bem']},
         * the function returns { greetings: [ 'ola', 'tudo bem' ] }, 
         */
        return Object.keys(this.sets).reduce((filtered, setname) => {
            let setvalues = this.sets[setname];
            let contains_values = this.get_contains(setvalues, user_message)
            
            if (contains_values.length > 0) {
                filtered[setname] = contains_values;
            }
            return filtered
        }, {})
    }
        
}

module.exports = {SetRecognizer};