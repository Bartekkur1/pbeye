const esClient = require('../src/esClient');
const { describe } = require("mocha");
const sinon = require('sinon');
const logger = require('../src/logger');
const { expect } = require('chai');
const { createSandbox } = require('sinon');
const pbDataMapping = require('../datamapping.json');

describe('EsClient tests', () => {
    const sandbox = createSandbox();

    const testConfig = {
        indexName: 'test'
    };

    before(() => {
        logger.level = 'error'
    });

    afterEach(() => {
        sandbox.restore();
    })

    describe("Initialization", () => {
        it('Should initialize esClient', async () => {
            pingStub = sandbox.stub().resolves();
            esClientStub = sandbox.stub(esClient, 'createEsClient').returns({
                ping: pingStub
            });
            validateStructureStub = sandbox.stub(esClient, 'validateEsStructure').resolves();

            await esClient.init(testConfig);

            sinon.assert.calledOnce(pingStub);
            sinon.assert.calledOnce(esClientStub);
            sinon.assert.calledOnce(validateStructureStub);
        });

        it('Should exit on connection fail', async () => {
            const loggerStub = sandbox.stub(logger, 'fatal');
            const processExitStub = sandbox.stub(process, 'exit');
            const pingStub = sandbox.stub().rejects();
            const esClientStub = sandbox.stub(esClient, 'createEsClient').returns({
                ping: pingStub
            });

            await esClient.init(testConfig);

            sinon.assert.calledOnce(esClientStub)
            sinon.assert.calledOnce(pingStub)
            sinon.assert.calledOnceWithExactly(processExitStub, 0);
            sinon.assert.calledTwice(loggerStub);
            const [loggerFatals] = loggerStub.args;
            const [errorMessage] = loggerFatals;
            expect(errorMessage).to.be.equal('Failed to establish ES connection!');
        });
    });

    describe('Structure check', () => {
        it('Should call index and mapping', async () => {
            const validateIndexStub = sandbox.stub(esClient, 'assertIndexExists').resolves({});
            const validateMappingStub = sandbox.stub(esClient, 'assertMappingExists').resolves({});

            await esClient.validateEsStructure();

            sinon.assert.calledOnce(validateIndexStub);
            sinon.assert.calledOnce(validateMappingStub);
        });

        it('Should check if index exists', async () => {
            const indicesExistsStub = sandbox.stub().resolves(true);
            sandbox.stub(esClient, 'client').value({
                indices: {
                    exists: indicesExistsStub
                }
            });

            await esClient.assertIndexExists();

            sinon.assert.calledOnce(indicesExistsStub);
        });

        it('Should create index if doesnt exists', async () => {
            const indicesExistsStub = sandbox.stub().resolves(false);
            const indicesCreateStub = sandbox.stub().resolves();
            sandbox.stub(esClient, 'client').value({
                indices: {
                    exists: indicesExistsStub,
                    create: indicesCreateStub
                }
            });

            esClient.indexName = testConfig.indexName;
            await esClient.assertIndexExists();

            sinon.assert.calledOnceWithExactly(indicesCreateStub,
                { index: testConfig.indexName });
            sinon.assert.calledOnce(indicesExistsStub);
        });

        it('Should check if mapping exists', async () => {
            const indicesGetMappingStub = sandbox.stub().resolves({
                pbeye: {
                    mappings: pbDataMapping
                }
            });
            sandbox.stub(esClient, 'client').value({
                indices: {
                    getMapping: indicesGetMappingStub
                }
            });

            esClient.indexName = testConfig.indexName;
            await esClient.assertMappingExists();

            sinon.assert.calledOnce(indicesGetMappingStub);
        });

        it('Should put mapping if current is invalid', async () => {
            const indicesGetMappingStub = sandbox.stub().resolves({
                pbeye: {
                    mappings: {}
                }
            });
            const putMappingStub = sandbox.stub().resolves();
            sandbox.stub(esClient, 'client').value({
                indices: {
                    getMapping: indicesGetMappingStub,
                    putMapping: putMappingStub
                }
            });

            esClient.indexName = testConfig.indexName;
            await esClient.assertMappingExists();

            sinon.assert.calledOnce(indicesGetMappingStub);
            sinon.assert.calledOnceWithExactly(putMappingStub, {
                index: testConfig.indexName,
                body: pbDataMapping
            });
        });
    });

});