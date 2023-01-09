import { moduleId, localizationID } from "./const.js";
import { SkillBoard } from "./apps/board.js";

Hooks.on('getSceneControlButtons', (controls) => {
    const tokens = controls.find((c) => c.name === 'token');
    if (tokens) {
        tokens.tools.push({
            name: moduleId,
            title: `${localizationID}.app-title`,
            icon: 'fas fa-user-graduate',
            visible: true,
            onClick: () => SkillBoard.activate(),
            button: true
        });
    }
});

Hooks.on('updateActor', () => {
    SkillBoard.refreshIfVisible();
});

Hooks.once('setup', () => {
    game.keybindings.register(moduleId, 'keybinding', {
        name: `${localizationID}.hotkey-binding`,
        editable: [
            { key: "KeyK", modifiers: []}
        ],
        onDown: (ctx) => {
            SkillBoard.toggle();
        }
    });

    game.settings.register(moduleId, 'additionalActors', {
        scope: 'client',
        type: Object,
        default: [],
        onChange: value => {
            SkillBoard.refresh(true);
        }
    });
    game.settings.register(moduleId, 'renderAsPopout', {
        name: `${localizationID}.render-as-popout`,
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
            SkillBoard.refresh(true);
        }
    });
});

Hooks.once('init', () => {
    const additionalOptions = [
        {
            name: "SKILL-BOARD.add-to-board",
            icon: '<i class="fas fa-dice-d20"></i>',
            condition: li => {
                const actor = game.actors.get(li.data("documentId"));
                const actorIdList = game.settings.get(moduleId, 'additionalActors') || [];
                const isAdded = actorIdList.includes(actor.id);
                return actor.permission >= 3 && actor !== game.user.character && !isAdded;
            },
            callback: li => {
                const actor = game.actors.get(li.data("documentId"));
                const actorIdList = game.settings.get(moduleId, 'additionalActors') || [];
                game.settings.set(moduleId, 'additionalActors', [...actorIdList, actor.id]);
            }
        },
        {
            name: "SKILL-BOARD.remove-from-board",
            icon: '<i class="fas fa-dice-d20"></i>',
            condition: li => {
                const actor = game.actors.get(li.data("documentId"));
                const actorIdList = game.settings.get(moduleId, 'additionalActors') || [];
                const isAdded = actorIdList.includes(actor.id);
                return actor.permission >= 3 && actor !== game.user.character && isAdded;
            },
            callback: li => {
                const actor = game.actors.get(li.data("documentId"));
                const actorIdList = game.settings.get(moduleId, 'additionalActors') || [];
                game.settings.set(moduleId, 'additionalActors', actorIdList.filter(a => a !== actor.id));
            }
        }
    ]

    Hooks.on("getActorDirectoryEntryContext", (html, entryOptions) => {
        entryOptions.push(...additionalOptions);
    });
});
