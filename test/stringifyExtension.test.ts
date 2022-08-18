import { describe, it, expect } from 'vitest'
import { Key } from '@puppeteer/replay';

import { InMemoryLineWriter } from './InMemoryLineWriter.js';
import { StringifyExtension } from '../src/stringifyExtension.js';


describe('StringifyExtension', () => {
  it('should correctly exports setViewport step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'setViewport' as const,
      width: 1905,
      height: 223,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
    };
    const flow = { title: 'setViewport step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).to.equal(
      'browser.windowRect({width: 1905, height: 223})\n',
    );
  });

  it('should correctly exports navigate step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'navigate' as const,
      url: 'chrome://new-tab-page/',
      assertedEvents: [
        {
          type: 'navigation' as const,
          url: 'chrome://new-tab-page/',
          title: 'New Tab',
        },
      ],
    };
    const flow = { title: 'navigate step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).to.equal(
      '.navigateTo("chrome://new-tab-page/")\n',
    );
  });

  it('should correctly exports click step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'click' as const,
      target: 'main',
      selectors: ['#test'],
      offsetX: 1,
      offsetY: 1,
    };
    const flow = { title: 'click step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal('.click("#test")\n');
  });

  it('should correctly exports change step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'change' as const,
      value: 'webdriverio',
      selectors: [['aria/Search'], ['#heading']],
      target: 'main',
    };
    const flow = { title: 'change step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal('.setValue("#heading", "webdriverio")\n');
  });

  it('should correctly exports keyDown step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'keyDown' as const,
      target: 'main',
      key: 'Enter' as Key,
      assertedEvents: [
        {
          type: 'navigation' as const,
          url: 'https://google.com',
          title: 'webdriverio - Google Search',
        },
      ],
    };
    const flow = { title: 'keyDown step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(
      `.perform(function() {
          const actions = this.actions({async: true});

          return actions
          .keyDown(this.Keys.ENTER);
        })\n`,
    );
  });

  it('should handle keyDown step when key is not supported', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'keyDown' as const,
      target: 'main',
      key: 'KEY_DOESNT_EXIST' as Key,
      assertedEvents: [
        {
          type: 'navigation' as const,
          url: 'https://google.com',
          title: 'webdriverio - Google Search',
        },
      ],
    };
    const flow = { title: 'keyDown step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal('\n');
  });

  it('should correctly exports keyUp step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'keyUp' as const,
      target: 'main',
      key: 'Enter' as Key,
      assertedEvents: [
        {
          type: 'navigation' as const,
          url: 'https://google.com',
          title: 'webdriverio - Google Search',
        },
      ],
    };
    const flow = { title: 'keyUp step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(
      `.perform(function() {
          const actions = this.actions({async: true});

          return actions
          .keyUp(this.Keys.ENTER);
        })\n`,
    );
  });

  it('should correctly exports scroll step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'scroll' as const,
      target: 'main',
      x: 0,
      y: 805,
    };
    const flow = { title: 'scroll step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`.execute('scrollTo(0, 805)')\n`);
  });

  it('should correctly exports doubleClick step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'doubleClick' as const,
      target: 'main',
      selectors: [['aria/Test'], ['#test']],
      offsetX: 1,
      offsetY: 1,
    };
    const flow = { title: 'doubleClick step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`.doubleClick("#test")\n`);
  });

  it('should correctly exports emulateNetworkConditions step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'emulateNetworkConditions' as const,
      download: 50000,
      upload: 50000,
      latency: 2000,
    };
    const flow = { title: 'emulateNetworkConditions step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`
    .setNetworkConditions({
      offline: false,
      latency: 2000,
      download_throughput: 50000,
      upload_throughput: 50000
    })\n`);
  });

  it('should correctly exports waitForElement step if operator is "=="', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'waitForElement' as const,
      selectors: ['#test'],
      operator: '==' as const,
      count: 2,
    };
    const flow = { title: 'waitForElement step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`
      .waitForElementVisible("#test", function(result) {
        if (result.value) {
          browser.expect.elements("#test").count.to.equal(2);
        }
      })\n`);
  });

  it('should correctly exports waitForElement step with timeout', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'waitForElement' as const,
      selectors: ['#test'],
      operator: '==' as const,
      count: 2,
      timeout: 2000,
    };
    const flow = { title: 'waitForElement step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`
      .waitForElementVisible("#test", 2000, function(result) {
        if (result.value) {
          browser.expect.elements("#test").count.to.equal(2);
        }
      })\n`);
  });

  it('should correctly exports waitForElement step if operator is "<="', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'waitForElement' as const,
      selectors: ['#test'],
      operator: '<=' as const,
      count: 2,
    };
    const flow = { title: 'waitForElement step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`
      .waitForElementVisible("#test", function(result) {
        if (result.value) {
          browser.elements('css selector', "#test", function (result) {
            browser.assert.ok(result.value.length <= 2, 'element count is less than 2');
          });
        }
      })\n`);
  });

  it('should correctly exports waitForElement step if operator is ">="', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'waitForElement' as const,
      selectors: ['#test'],
      operator: '>=' as const,
      count: 2,
    };
    const flow = { title: 'waitForElement step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`
      .waitForElementVisible("#test", function(result) {
        if (result.value) {
          browser.elements('css selector', "#test", function (result) {
            browser.assert.ok(result.value.length >= 2, 'element count is greater than 2');
          });
        }
      })\n`);
  });

  it('should correctly add Hover Step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'hover' as const,
      selectors: ['#test'],
    };
    const flow = { title: 'Hover step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`.moveToElement("#test", 0, 0)\n`);
  });
});
