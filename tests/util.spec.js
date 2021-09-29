const { expect } = require('chai');
const sinon = require('sinon');
const { sleep, getDateTime, readWebcamImage } = require('../src/util');
const jimp = require('jimp');

describe('Util tests', () => {

    const clock = sinon.useFakeTimers();

    describe('Sleep', () => {
        it('Should resolve using setTimeout', () => {
            const resolved = false;
            sleep(10000).then(() => {
                resolved = true
            });
            expect(resolved).to.be.false;
            clock.tickAsync(10000).then(() => {
                expect(resolved).to.be.true;
            });
        });
    });

    describe('GetDateTime', () => {
        beforeEach(() => {
            clock.reset();
        });

        it('Should return time in ms', () => {
            const time = getDateTime();
            expect(time).to.be.an('number');
            expect(time).to.be.equal(0);
        });

        it('Should return current time', () => {
            const time = getDateTime();
            expect(time).to.be.equal(0);
            clock.tickAsync(10000)
                .then(() => {
                    expect(time).to.be.equal(10000);
                });
        });
    });

    describe('ReadWebcamImage', () => {
        const sandbox = sinon.createSandbox();

        afterEach(() => {
            sandbox.restore();
        });

        it('Should use jimp to read file', async () => {
            const readStub = sandbox.stub(jimp, 'read').resolves({ grayscale: () => { } });

            await readWebcamImage();

            sinon.assert.calledOnce(readStub);
        });

        it('Should grayscale the image', async () => {
            const grayscaleStub = sandbox.stub().resolves();
            const readStub = sandbox.stub(jimp, 'read').resolves({ grayscale: grayscaleStub });

            await readWebcamImage();

            sinon.assert.calledOnce(readStub);
            sinon.assert.calledOnce(grayscaleStub);
        });
    });
});