const fs = require("fs");

let file = process.argv[2];

if (!file) {
    console.log("PackError: Insert a file.");
    process.exit(1);
}

let code = fs.readFileSync(file, "utf8");

function lexer(value) {
    let final = value.split("\n").filter(Boolean);
    let result = [];
    let ops = ["+", ";", "-", "*", "!", "@", "#", "%", "^", "&", ".", ",", "/", "?", ":", "=", "(", ")", "[", "]", "{", "}", "<", ">"];

    for (let i = 0; i < final.length; i++) {
        let current_line = final[i];
        let chars = current_line.split("");
        let tokens = [];

        let current = "";
        let in_string = false;
        let string_type = "";

        for (let j = 0; j < chars.length; j++) {
            let char = chars[j];

            if (!in_string && (char === `"` || char === `'` || char === "`")) {
                if (current.trim()) {
                    tokens.push(current.trim());
                }

                current = char;
                in_string = true;
                string_type = char;
                continue;
            }

            if (in_string) {
                current += char;

                if (char === "\\" && j + 1 < chars.length) {
                    current += chars[j + 1];
                    j++;
                    continue;
                }

                if (char === string_type) {
                    tokens.push(current);
                    current = "";
                    in_string = false;
                    string_type = "";
                }

                continue;
            }

            if (ops.includes(char)) {
                if (current.trim()) {
                    tokens.push(current.trim());
                }

                tokens.push(char);
                current = "";
                continue;
            }

            if (char === " " || char === "\t") {
                if (current.trim()) {
                    tokens.push(current.trim());
                }

                current = "";
                continue;
            }

            current += char;
        }

        if (current.trim()) {
            tokens.push(current.trim());
        }

        let line_result = [];

        for (let j = 0; j < tokens.length; j++) {
            let token = tokens[j];

            let is_op = ops.includes(token);
            let is_number = !isNaN(token);
            let is_string =
                (token.startsWith(`"`) && token.endsWith(`"`)) ||
                (token.startsWith(`'`) && token.endsWith(`'`)) ||
                (token.startsWith("`") && token.endsWith("`"));

            line_result.push({
                type: is_op || is_number || is_string,
                value: token
            });
        }

        result.push(line_result);
    }

    return result;
}

function err(value){
    console.log("PackError: " + value);
}

function codegen(value){
    let result = ``;

    for(let i = 0; i < value.length; i ++){
        let current_line = value[i];

        for(let j = 0; j < current_line.length; j ++){
            let current_token = current_line[j];

            if(current_token.type){
                if(current_token.value === "#"){
                    result += `// `
                }
                else {
                    result += `${current_token.value}`;
                }
            }
            else {
                switch(current_token.value){
                    case "print":
                        result += `process.stdout.write `;
                        break;
                    case "return":
                        result += `return `;
                        break;
                    case "for":
                        result += `for `;
                        break;
                    case "while":
                        result += `while `;
                        break;
                    case "true":
                        result += `true `;
                        break;
                    case "false":
                        result += `false `;
                        break;
                    case "fn":
                        result += `function `;
                        break;
                    case "if":
                        result += `if `;
                        break;
                    case "else":
                        result += `else `;
                        break;
                    case "elif":
                        result += `else if `;
                        break;
                    case "and":
                        result += `&& `;
                        break;
                    case "or":
                        result += `|| `;
                        break;
                    case "not":
                        result += `!= `;
                        break;
                    case "is":
                        result += `== `;
                        break;
                    case "const":
                        result += `const `;
                        break;
                    case "let":
                        result += `let `
                        break;
                    default:
                        result += ` _${current_token.value} `
                        break;
                }
            }
        }
        result += "\n";
    }
    return result;
}

function main(value) {
    value = lexer(value);
    value = codegen(value);
    eval(value);
}

main(code);
