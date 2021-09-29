const motionDao = require('../src/motion.dao');
const esClient = require('../src/esClient');
const sinon = require('sinon');

describe('Motion DAO tests', () => {

    const testMotionObject = {
        activity: 0.5,
        timestamp: 1632943072024
    };

    const testIndexName = 'testIndex';

    it('Should call proper es methods', async () => {
        const indexStub = sinon.stub().resolves();
        sinon.stub(esClient, 'client').value({
            index: indexStub
        });

        await motionDao.save(testMotionObject, testIndexName);

        sinon.assert.calledOnceWithExactly(indexStub,
            { body: testMotionObject, index: testIndexName });
    });
});