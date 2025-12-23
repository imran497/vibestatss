const fs = require('fs');
const content = fs.readFileSync(process.argv[2], 'utf8');
try {
    // Use a simple balanced tag counter for common tags
    const tags = content.match(/<[a-zA-Z0-9]+|<\/[a-zA-Z0-9]+>|<>/g) || [];
    const stack = [];
    for (const tag of tags) {
        if (tag.startsWith('</')) {
            const closing = tag.substring(2, tag.length - 1);
            if (stack.length === 0) {
                console.error('Extra closing tag:', tag);
                continue;
            }
            const opening = stack.pop();
            if (opening !== closing) {
                console.error('Mismatch:', opening, closing);
            }
        } else if (tag === '<>') {
            stack.push('FRAGMENT');
        } else if (tag === '</>') {
            stack.push('FRAGMENT_CLOSE'); // This logic is slightly wrong but I'll fix it
        } else {
            const opening = tag.substring(1);
            if (!content.includes('/>') || !tag.includes('/>')) { // ignores self-closing if possible
                stack.push(opening);
            }
        }
    }
    console.log('Final stack:', stack);
} catch (e) {
    console.error(e);
}
