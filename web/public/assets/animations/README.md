# Universal Animation Library — Standard

Autor: **Quaternius**.

- Fonte oficial: https://quaternius.itch.io/universal-animation-library
- Site: https://quaternius.com/packs/universalanimationlibrary.html
- Cópia glTF consultada: https://github.com/J-Ponzo/gltf-universal-animation-library
- Licença: CC0 1.0, texto em `CC0.txt`.

Os arquivos `source.gltf` e `AnimationLibrary_Godot_Standard.bin` são a versão Standard gratuita. O modelo Finn e a espada foram construídos neste projeto; os movimentos são adaptações das animações acima.

`export-finn-animated.mjs` e `src/rig-finn.js` adaptam os comprimentos dos ossos às proporções do Finn, vinculam as malhas por skinning rígido e preservam as curvas de rotação. Translações e escalas animadas são removidas para manter o movimento do mundo sob controle da física do jogo.

Sete clipes estão no GLB: Sword_Idle, Sword_Attack, Walk_Loop, Sprint_Loop, Punch_Jab, Punch_Cross e Hit_Chest. Roll/esquiva não foi integrado nesta atualização.
