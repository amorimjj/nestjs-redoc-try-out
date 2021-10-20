import { normalizeSnippetCode } from './normalize-snippet-code';


describe('normalizeSnippetCode', () => {

    it('should fix the code', () => {
        const code = `const options = {
            "method": "DELETE",
            "hostname": "localhost",
            "port": "3000",
            "path": "/api/wallets/%7Bid%7D",
            "headers": {}
        };`;

        expect(normalizeSnippetCode(code)).toEqual(`const options = {
            "method": "DELETE",
            "hostname": "localhost",
            "port": "3000",
            "path": "/api/wallets/{id}",
            "headers": {}
        };`);
    });
});