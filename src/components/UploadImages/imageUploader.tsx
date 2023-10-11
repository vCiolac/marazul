import { useContext, useState } from 'react';
import { Context } from '../../context/Context';
import ErrorMessage from '../Error/errorMsg';
import CompressImg from './CompressImg/CompressImg';
import uploadMetadados from './CompressImg/processExif';
import uploadImages from './uploadImages';
import FetchAlbums from '../../hooks/fetchAlbums';

const UploadImageForm = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [albumName, setAlbumName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const { errorMsg, setErrorMsg } = useContext(Context);
  const { albums } = FetchAlbums();

  const handleAlbumNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lowerCaseName = e.target.value.toLowerCase();
    setAlbumName(lowerCaseName);
  };

  const handleCreateAlbum = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCreatingAlbum(!isCreatingAlbum);
    setAlbumName('');
  };

  const handleUseExistingAlbum = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    setIsCreatingAlbum(false);
    setAlbumName(e.target.value)
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const filesArray = Array.from(selectedFiles);
      setFiles(filesArray);
    }
  };

  const handleCompressedFiles = async (compressedFiles: File[]) => {
    if (isCreatingAlbum && albumName === '') {
      return setErrorMsg('Nome do álbum não pode ser vazio!');
    }
    setIsUploading(true);
    try {
      await uploadMetadados(files, albumName);
      await uploadImages(compressedFiles, albumName);
      setIsUploading(false);
      setErrorMsg('Imagens enviadas com sucesso!');
      setFiles([]);
    } catch (error: unknown) {
      setIsUploading(false);
      setErrorMsg(`Erro ao enviar imagens: ${(error as Error).message}`);
      setFiles([]);
    }
  };

  return (
    <div>
      <form>
        <h3>Adicionar arquivos</h3>
        <button onClick={handleCreateAlbum}>
          {isCreatingAlbum ? "Usar evento existente" : "Criar evento"}
        </button>
        {isCreatingAlbum ? (
          <label>
            Nome do evento:
            <input type="text" value={albumName} placeholder='NÃO ADICIONAR ESPAÇOS' onChange={handleAlbumNameChange} />
          </label>
        ) : (
          <label>
            <select value={albumName} onChange={handleUseExistingAlbum}>
              <option value="">Selecione um evento existente</option>
              {albums.map((album) => (
                <option key={album} value={album}>
                  {album}
                </option>
              ))}
            </select>
          </label>
        )}
      </form>
      <input
        type="file"
        multiple // Permitir seleção de várias imagens
        accept="image/*" // Aceitar apenas arquivos de imagem
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        id="file-input"
      />
      <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
        Selecionar Imagens
      </label>
      <button onClick={() => setFiles([])}>Limpar seleção</button>
      {files.length > 0 &&
        <div>
          <h3>Imagens Selecionadas</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      }
      {isUploading && <p>Enviando imagens...</p>}
      {errorMsg && <ErrorMessage message={errorMsg} />}
      <CompressImg files={files} albumName={albumName} onCompressed={handleCompressedFiles} />
    </div>
  );
};

export default UploadImageForm;
