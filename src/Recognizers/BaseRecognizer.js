class BaseRecognizer {
    get_equals(setvalues, user_message) {
        /**
           > BaseRecognizer.get_equals(['Você é', 'Você não'], 'Você não')
           returns ['Você não'], because 'Você não' == 'Você não'
           > BaseRecognizer.get_equals(['Você é', 'Você não é'], 'Você não')
           returns [] 
         */
        return setvalues.filter((setvalue) => {
            if (user_message == setvalue) {
                return setvalue
            }
        })
    }

    get_contains(setvalues, user_message) {
        // > BaseRecognizer.get_contains(['você'], 'blabla, você blabla') 
        // returns ['você']
        return setvalues.filter((setvalue) => {
            if (user_message.includes(setvalue)) {
                return setvalue
            }
        })
    }
        
}

module.exports = {BaseRecognizer};