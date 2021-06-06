import defaultClint, { clint as clintBuilder } from '../clint';
jest.mock('process', () => {
    return { argv: ['node', 'clint.js', '-p', 'foo/bar', '-d', 'true'] }
});

describe('test suite', () => {
    let state = {};
    let clint;
    beforeAll(() => {
        clint = clintBuilder();
        state = {};
        clint.command('--path', '-p', 'path to the project folder')
        clint.command('--debug', '-d', 'deploy in debug mode')

        clint.on('command', function (name, value) {
            switch (name) {
                case '--path':
                    state.output = value
                    break
                case '--debug':
                    state.debug = true
                    break
            }
        })
    });

    it('should handle all commands', done => {
        clint.on('complete', () => {
            expect(state.debug).toBe(true);
            expect(state.output).toBe('foo/bar');
            done()
        })
        try {
            clint.parse(['--path', 'foo/bar', '--debug'])
        } catch (e) {
            done(e)
        }
    })

    it('should handle all shorthands', done => {
        clint.on('complete', () => {
            expect(state.debug).toBe(true);
            expect(state.output).toBe('foo/bar');
            done()
        })
        try {
            clint.parse(['-p', 'foo/bar', '-d'])
        } catch (e) {
            done(e)
        }
    })

    it('should handle all shorthands', done => {
        clint.on('complete', () => {
            expect(state.debug).toBe(true);
            expect(state.output).toBe('foo/bar');
            done()
        })
        try {
            clint.go()
        } catch (e) {
            done(e)
        }
    })

    it('default clint', done => {

        defaultClint.command('--path', '-p', 'path to the project folder')
        // Bug? If we don't define the other commands everything 
        // gets interpreted as parameter to the last command parsed...
        defaultClint.command('--debug', '-d', 'deploy in debug mode')

        defaultClint.on('command', function (name, value) {
            if (name == '--path') done();
        });

        try {
            defaultClint.go()
        } catch (e) {
            done(e)
        }

    })

})