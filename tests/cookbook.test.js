const path = require("path");
const { TiddlyWiki } = require("tiddlywiki");

const ROOT_DIR = path.resolve(__dirname, "..");

describe("Cookbook Plugin ($:/plugins/mblackman/cookbook)", () => {
  let $tw;

  beforeAll(() => {
    process.env.TIDDLYWIKI_PLUGIN_PATH = path.join(ROOT_DIR, "plugins");
    $tw = TiddlyWiki();
    $tw.boot.argv = [path.join(ROOT_DIR, "demo")];
    $tw.boot.boot();
    global.$tw = $tw;
    if ($tw.syncer) {
      if ($tw.syncer.pollTimerId) {
        clearInterval($tw.syncer.pollTimerId);
      }
      $tw.syncer.syncadaptor = { isReady: () => false };
    }
  });

  afterAll(() => {
    delete global.$tw;
  });

  function renderWithGlobals(wikitext, variables = {}) {
    const wrapped = `\\import [[$:/plugins/mblackman/cookbook/procedures]]\n${wikitext}`;
    return $tw.wiki.renderText("text/html", "text/vnd.tiddlywiki", wrapped, {
      variables,
    });
  }

  function renderPlainWithGlobals(wikitext, variables = {}) {
    const wrapped = `\\import [[$:/plugins/mblackman/cookbook/procedures]]\n${wikitext}`;
    return $tw.wiki
      .renderText("text/plain", "text/vnd.tiddlywiki", wrapped, { variables })
      .trim();
  }

  function renderTiddlerBody(title) {
    return $tw.wiki.renderTiddler("text/html", "$:/core/ui/ViewTemplate/body", {
      variables: {
        currentTiddler: title,
        storyTiddler: title,
      },
    });
  }

  test("loads plugin manifest with >=5.4.0 baseline and no external dependencies", () => {
    const pluginTiddler = $tw.wiki.getTiddler("$:/plugins/mblackman/cookbook");
    expect(pluginTiddler).toBeDefined();
    expect(pluginTiddler.fields.name).toBe("Cookbook");
    expect(pluginTiddler.fields["core-version"]).toBe(">=5.4.0");
    expect(pluginTiddler.fields.version).toBe("0.1.1");
    expect(pluginTiddler.fields["plugin-type"]).toBe("plugin");
    expect(pluginTiddler.fields.dependents || []).toEqual([]);
    expect(pluginTiddler.fields.list).toEqual(["readme", "config", "tree"]);
  });

  test("registers all expected shadow tiddlers", () => {
    const expectedShadows = [
      "$:/plugins/mblackman/cookbook/readme",
      "$:/plugins/mblackman/cookbook/config",
      "$:/plugins/mblackman/cookbook/tree",
      "$:/plugins/mblackman/cookbook/dashboard",
      "$:/plugins/mblackman/cookbook/procedures",
      "$:/plugins/mblackman/cookbook/images/cookbook-icon",
      "$:/plugins/mblackman/cookbook/styles/suite-tokens",
      "$:/plugins/mblackman/cookbook/styles/index",
      "$:/plugins/mblackman/cookbook/ui/ViewTemplate/recipe",
      "$:/plugins/mblackman/cookbook/ui/ViewTemplate/cooklog",
      "$:/plugins/mblackman/cookbook/ui/sidebar-tab",
      "$:/plugins/mblackman/cookbook/ui/toolbar-button",
      "$:/plugins/mblackman/cookbook/ui/Buttons/new-recipe",
      "$:/config/ViewTemplateBodyFilters/recipe",
    ];

    for (const title of expectedShadows) {
      expect($tw.wiki.isShadowTiddler(title)).toBe(true);
    }
  });

  test("enforces 3-Tier Suite Design System CSS contract (MASTER.md)", () => {
    const suiteTokens = $tw.wiki.getTiddler(
      "$:/plugins/mblackman/cookbook/styles/suite-tokens"
    );
    const indexStyles = $tw.wiki.getTiddler(
      "$:/plugins/mblackman/cookbook/styles/index"
    );

    expect(suiteTokens.fields.type).toBe("text/vnd.tiddlywiki");
    expect(suiteTokens.fields.tags).toContain("$:/tags/Stylesheet");
    expect(suiteTokens.fields.text).toContain(":where(:root, .tc-page-container)");
    expect(suiteTokens.fields.text).toContain("color-mix(in oklab,");
    expect(suiteTokens.fields.text).toContain("--suite-border-control:");
    expect(suiteTokens.fields.text).toContain("color-scheme: light dark;");
    expect(suiteTokens.fields.text).toContain("accent-color: var(--suite-accent);");
    expect(suiteTokens.fields.text).toContain('data-suite-density="touch"');

    expect(indexStyles.fields.type).toBe("text/css");
    expect(indexStyles.fields.tags).toContain("$:/tags/Stylesheet");
    expect(indexStyles.fields.text).not.toContain("<<colour");
    expect(indexStyles.fields.text).toContain("--cb-surface-card: var(--suite-surface-card)");
    expect(indexStyles.fields.text).toContain("container: suite-view / inline-size");
    expect(indexStyles.fields.text).toContain("@container suite-view (max-width: 640px)");
    expect(indexStyles.fields.text).toContain("@container suite-view (max-width: 420px)");
    expect(indexStyles.fields.text).toContain("@container (width < 600px)");
    expect(indexStyles.fields.text).toContain("font-variant-numeric: tabular-nums");
    expect(indexStyles.fields.text).toContain("@media (forced-colors: active)");
    expect(indexStyles.fields.text).toContain(":hover:not(:disabled, [aria-disabled=\"true\"])");
  });

  test("computes f.scale-Factor and f.scale-Qty across integers, decimals, fractions, and mixed numbers", () => {
    expect(
      renderPlainWithGlobals("{{{ [f.scale-Factor[4],[6]] }}}")
    ).toBe("1.5");
    expect(
      renderPlainWithGlobals("{{{ [f.scale-Factor[4],[]] }}}")
    ).toBe("1");

    // Integer scaling
    expect(
      renderPlainWithGlobals("{{{ [f.scale-Qty[400],[1.5]] }}}")
    ).toBe("600");

    // Simple fraction scaling
    expect(
      renderPlainWithGlobals("{{{ [f.scale-Qty[1/2],[1]] }}}")
    ).toBe("0.5");
    expect(
      renderPlainWithGlobals("{{{ [f.scale-Qty[1/2],[2]] }}}")
    ).toBe("1");
    expect(
      renderPlainWithGlobals("{{{ [f.scale-Qty[1/2],[0.5]] }}}")
    ).toBe("0.25");

    // Mixed number scaling
    expect(
      renderPlainWithGlobals("{{{ [f.scale-Qty[1 1/2],[2]] }}}")
    ).toBe("3");
    expect(
      renderPlainWithGlobals("{{{ [f.scale-Qty[2 1/4],[0.5]] }}}")
    ).toBe("1.13");

    // Repeating fraction rounded to 2 decimal places
    expect(
      renderPlainWithGlobals("{{{ [f.scale-Qty[1/3],[1]] }}}")
    ).toBe("0.33");
  });

  test("renders <<ing>> procedure with live scaling and ephemeral mise en place state", () => {
    const recipeTitle = "Crisis-Proof Cast Iron Pan Pizza";
    const scaleTiddler = `$:/temp/recipe/scale/${recipeTitle}`;
    const miseTiddler = `$:/temp/recipe/mise/${recipeTitle}/[[Bread Flour]]400`;

    try {
      // Default 1x scale, unchecked
      const html1x = renderWithGlobals(
        '<<ing qty="400" unit="g" item="[[Bread Flour]]" note="sifted">>',
        { currentTiddler: recipeTitle, storyTiddler: recipeTitle }
      );
      expect(html1x).toContain('<strong class="tw-recipe-ing-qty suite-tabular-nums">400</strong>');
      expect(html1x).toContain("tw-recipe-ing-active");
      expect(html1x).toContain("(sifted)");

      // Set 1.5x scale and mark mise en place done
      $tw.wiki.addTiddler({ title: scaleTiddler, text: "1.5" });
      $tw.wiki.addTiddler({ title: miseTiddler, status: "done" });

      const html15x = renderWithGlobals(
        '<<ing qty="400" unit="g" item="[[Bread Flour]]" note="sifted">>',
        { currentTiddler: recipeTitle, storyTiddler: recipeTitle }
      );
      expect(html15x).toContain('<strong class="tw-recipe-ing-qty suite-tabular-nums">600</strong>');
      expect(html15x).toContain("tw-recipe-ing-done");
    } finally {
      $tw.wiki.deleteTiddler(scaleTiddler);
      $tw.wiki.deleteTiddler(miseTiddler);
    }
  });

  test("routes Recipe and CookLog tiddlers via ViewTemplateBody cascade", () => {
    const recipeHtml = renderTiddlerBody("Crisis-Proof Cast Iron Pan Pizza");
    expect(recipeHtml).toContain("tw-recipe-container");
    expect(recipeHtml).toContain("Serious Eats Foolproof Pan Pizza");
    expect(recipeHtml).toContain("Dough (70% Hydration)");
    expect(recipeHtml).toContain("Pinned Kitchen Notes &amp; Tweaks");
    expect(recipeHtml).toContain("Cooked 1× (Last: 2026-10-25)");

    const cookLogHtml = renderTiddlerBody(
      "CookLog: Crisis-Proof Cast Iron Pan Pizza (2026-10-25)"
    );
    expect(cookLogHtml).toContain("tw-cooklog-view");
    expect(cookLogHtml).toContain("Crispiest frico edge yet");
    expect(cookLogHtml).toContain("Keep the 3.5g yeast adjustment");
  });

  test("switches Recipe ViewTemplate into touch density when Cook Mode is active and scales yield", () => {
    const recipeTitle = "Crisis-Proof Cast Iron Pan Pizza";
    const scaleTiddler = `$:/temp/recipe/scale/${recipeTitle}`;
    const cookModeTiddler = `$:/temp/recipe/cookmode/${recipeTitle}`;

    try {
      $tw.wiki.addTiddler({ title: scaleTiddler, text: "2" });
      $tw.wiki.addTiddler({ title: cookModeTiddler, text: "yes" });

      const html = renderTiddlerBody(recipeTitle);
      expect(html).toContain('data-suite-density="touch"');
      expect(html).toContain("tw-recipe-cookmode-on");
      expect(html).toContain("Exit Cook Mode");
      expect(html).toContain("Yield (2×)");
      expect(html).toContain("4 10-inch pizzas");
      // 400g flour * 2 = 800g
      expect(html).toContain('<strong class="tw-recipe-ing-qty suite-tabular-nums">800</strong>');
      // 1/2 tsp oregano * 2 = 1 tsp
      expect(html).toContain('<strong class="tw-recipe-ing-qty suite-tabular-nums">1</strong>');
    } finally {
      $tw.wiki.deleteTiddler(scaleTiddler);
      $tw.wiki.deleteTiddler(cookModeTiddler);
    }
  });

  test("displays sub-recipe component backlinks when a Recipe is linked inside another Recipe", () => {
    const subRecipeHtml = renderTiddlerBody("Crushed San Marzano Tomatoes");
    expect(subRecipeHtml).toContain("Used as a component in:");
    expect(subRecipeHtml).toContain("Crisis-Proof Cast Iron Pan Pizza");
  });

  test("renders Cookbook Dashboard and filters recipes by dish-type, status, and search query", () => {
    const filterState = "$:/temp/recipe/dashboard-filter";

    try {
      const fullDashboard = $tw.wiki.renderTiddler(
        "text/html",
        "$:/plugins/mblackman/cookbook/dashboard"
      );
      expect(fullDashboard).toContain("Crisis-Proof Cast Iron Pan Pizza");
      expect(fullDashboard).toContain("Crushed San Marzano Tomatoes");
      expect(fullDashboard).toContain("2026-10-25");

      // Filter by dish-type = Sauce
      $tw.wiki.addTiddler({
        title: filterState,
        "dish-type": "Sauce",
        status: "",
        search: "",
      });
      const sauceDashboard = $tw.wiki.renderTiddler(
        "text/html",
        "$:/plugins/mblackman/cookbook/dashboard"
      );
      // Recipe table should show Crushed San Marzano Tomatoes; Recent Cook Logs still links Pan Pizza
      expect(sauceDashboard).toContain("Crushed San Marzano Tomatoes");

      // Filter by non-matching search query
      $tw.wiki.addTiddler({
        title: filterState,
        "dish-type": "",
        status: "",
        search: "nonexistent-dish-xyz",
      });
      const emptyDashboard = $tw.wiki.renderTiddler(
        "text/html",
        "$:/plugins/mblackman/cookbook/dashboard"
      );
      expect(emptyDashboard).toContain("No matching recipes found.");
    } finally {
      $tw.wiki.deleteTiddler(filterState);
    }
  });

  test("renders compact Sidebar Tool View for skinny columns and shares filter state", () => {
    const filterState = "$:/temp/recipe/dashboard-filter";

    try {
      const sidebarHtml = $tw.wiki.renderTiddler(
        "text/html",
        "$:/plugins/mblackman/cookbook/ui/sidebar-tab"
      );
      expect(sidebarHtml).toContain("tw-recipe-sidebar");
      expect(sidebarHtml).toContain('data-suite-density="compact"');
      expect(sidebarHtml).toContain("tw-recipe-sidebar-card");
      expect(sidebarHtml).toContain("Crisis-Proof Cast Iron Pan Pizza");
      expect(sidebarHtml).toContain("Crushed San Marzano Tomatoes");
      expect(sidebarHtml).toContain("Open Dashboard");

      $tw.wiki.addTiddler({
        title: filterState,
        "dish-type": "Baking",
        status: "",
        search: "",
      });
      const filteredSidebar = $tw.wiki.renderTiddler(
        "text/html",
        "$:/plugins/mblackman/cookbook/ui/sidebar-tab"
      );
      expect(filteredSidebar).toContain("Crisis-Proof Cast Iron Pan Pizza");
      expect(filteredSidebar).toContain("Clear Filters");
    } finally {
      $tw.wiki.deleteTiddler(filterState);
    }
  });
});
