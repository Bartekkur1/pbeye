const esClient = require('../src/esClient');
const pbEye = require('../src/pbeye');
const sinon = require('sinon');
const config = require('../config/config.json');
const jimp = require('jimp');
const util = require('../src/util');
const { expect } = require('chai');

describe('PbEye tests', () => {
    const sandbox = sinon.createSandbox();
    const timer = sinon.useFakeTimers();

    afterEach(() => {
        sandbox.restore();
    });

    beforeEach(() => {
        timer.reset();
    });

    describe('Initialization', () => {

        it('Should initialize esClient', async () => {
            const esInitStub = sandbox.stub(esClient, 'init').resolves();

            pbEye.baseImage = 1;
            await pbEye.init();

            sinon.assert.calledOnceWithExactly(esInitStub, config);
        });

        it('Should load base image if null', async () => {
            const esInitStub = sandbox.stub(esClient, 'init').resolves();
            const grayscaleStub = sandbox.stub().returns();
            const readStub = sandbox.stub(jimp, 'read').resolves({
                grayscale: grayscaleStub
            });

            pbEye.baseImage = null;
            await pbEye.init();

            sinon.assert.calledOnce(esInitStub);
            sinon.assert.calledOnce(readStub);
            sinon.assert.calledOnce(grayscaleStub);
        });
    });

    describe('Check Timeout', () => {
        it('Should continue if is not timedout', async () => {
            const sleepSpy = sandbox.spy(util, 'sleep');

            pbEye.timeout = false;
            await pbEye.checkTimeout();

            sinon.assert.notCalled(sleepSpy);
        });

        it('Should sleep if timedout', async () => {
            const resolved = false;
            const sleepSpy = sandbox.spy(util, 'sleep');

            pbEye.timeout = true;

            pbEye.checkTimeout()
                .then(() => {
                    resolved = true;
                });

            expect(resolved).to.be.false;
            timer.tickAsync(config.timeoutTime)
                .then(() => {
                    expect(resolved).to.be.true;
                    expect(pbEye.timeout).to.be.false;
                    sinon.assert.calledOnce(sleepSpy);
                });
        });
    });
});